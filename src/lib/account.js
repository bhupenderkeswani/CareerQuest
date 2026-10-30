// Student accounts: Google sign-in (Supabase Auth), the profile, guardian consent for under-18s,
// and syncing progress to the account.
//
// Guests never touch any of this. Everything the server holds sits behind functions that check who is
// calling (see supabase/migrations/0003_accounts.sql), and nothing is saved for an under-18 student until
// a guardian has approved.
import { create } from 'zustand';
import { supabase, isConfigured } from './supabase';
import { useStore } from '../store';
import { docHash, merge3, pickDoc, SYNC_KEYS } from './sync';
import { track } from './analytics';

export const INTENT_KEY = 'cq_auth_intent'; // set just before leaving for Google, so we know the return is a sign-in

// status: unknown | in | out.   sync: idle | saving | saved | offline | error | blocked
export const useAuth = create(() => ({ status: isConfigured ? 'unknown' : 'out', sync: 'idle', lastSyncedAt: null }));
const setAuth = (p) => useAuth.setState(p);
const store = () => useStore.getState();

export const toUser = (p) => ({
  id: p.user_id, nickname: p.nickname, classStage: p.class_stage, state: p.state || '',
  minor: p.is_minor, consent: p.consent_status, createdAt: Date.parse(p.created_at),
});
export const consentAllowsSync = (u) => Boolean(u) && (u.consent === 'not_required' || u.consent === 'approved');

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) { const e = new Error(error.message); e.code = error.code; throw e; }
  return data;
}

const isOffline = () => !navigator.onLine || store().ui.simOffline;

// ---------------------------------------------------------------------------
// Sign in / out
// ---------------------------------------------------------------------------
export async function signInWithGoogle() {
  if (!supabase) return { error: 'Sign-in is not set up in this build.' };
  try { sessionStorage.setItem(INTENT_KEY, '1'); } catch { /* storage blocked: the return trip will just not auto-navigate */ }
  track('auth_start', { method: 'google' });
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    // The route lives in the URL hash, so Supabase sends the user back to the page itself (PKCE puts ?code= in the query).
    options: { redirectTo: `${location.origin}${location.pathname}`, queryParams: { prompt: 'select_account' } },
  });
  if (error) { try { sessionStorage.removeItem(INTENT_KEY); } catch { /* ignore */ } return { error: error.message }; }
  return {};
}

// Signing out removes this student's progress from the device (it lives in the account), so a shared phone
// does not keep it.
export async function signOutAccount() {
  try { if (supabase) await supabase.auth.signOut(); } catch { /* the session may already be gone */ }
  store().clearAccount();
  setAuth({ status: 'out', sync: 'idle' });
  track('sign_out');
}

export async function deleteAccountRemote() {
  await rpc('delete_my_account');
  try { await supabase.auth.signOut(); } catch { /* the user no longer exists, so this can fail harmlessly */ }
  store().deleteAccount();
  setAuth({ status: 'out', sync: 'idle' });
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export async function createProfile({ nickname, classStage, state, dob }) {
  const p = await rpc('create_my_profile', { p_nickname: nickname, p_class_stage: classStage, p_state: state || null, p_dob: dob || null });
  const user = toUser(p);
  store().setAccount(user);
  store().setStartStage(classStage === 'c11' ? 0 : classStage === 'college' ? 2 : 1);
  track('profile_created', { minor: user.minor });
  return user;
}

// Re-reads the profile. When a guardian has just approved, saving starts.
export async function refreshProfile() {
  const p = await rpc('my_profile');
  if (!p) return null;
  const prev = store().user;
  const user = toUser(p);
  store().setAccount(user);
  if (!consentAllowsSync(prev) && consentAllowsSync(user)) {
    store().pushToast('Your guardian said OK. Saving your progress to your account.', 'info');
    track('guardian_consent_approved');
    syncNow();
  }
  return user;
}

// ---------------------------------------------------------------------------
// Guardian consent
// ---------------------------------------------------------------------------
export const consentLink = (token) => `${location.origin}${location.pathname}#/consent/${token}`;

export async function requestGuardianLink() {
  const token = await rpc('request_guardian_consent');
  await refreshProfile();
  track('guardian_consent_sent');
  return consentLink(token);
}
export const consentPreview = (token) => rpc('consent_preview', { p_token: token });
export const approveConsent = (token, name) => rpc('approve_guardian_consent', { p_token: token, p_guardian_name: name });
export const withdrawConsent = (token) => rpc('withdraw_guardian_consent', { p_token: token });

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------
let running = null;
let again = false;

export function syncNow() {
  if (running) { again = true; return running; }
  running = run().finally(() => { running = null; if (again) { again = false; syncNow(); } });
  return running;
}

async function run() {
  const user = store().user;
  if (!supabase || !consentAllowsSync(user)) return;
  if (isOffline()) { setAuth({ sync: 'offline' }); return; }
  setAuth({ sync: 'saving' });
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const server = await rpc('my_state');
      if (server.blocked) { setAuth({ sync: 'blocked' }); await refreshProfile().catch(() => {}); return; } // e.g. a guardian withdrew consent
      const st = store();
      const local = pickDoc(st);
      const meta = st.syncMeta && st.syncMeta.userId === user.id ? st.syncMeta : null;
      const merged = server.data ? merge3(meta?.base, local, server.data) : local;
      if (docHash(merged) !== docHash(local)) st.applyDoc(merged);
      // What the device now holds (applyDoc fills in defaults) is what gets compared, saved and remembered.
      const final = pickDoc(store());
      if (server.data && docHash(final) === docHash(server.data)) {
        st.setSyncMeta({ userId: user.id, rev: server.rev, base: final });
        setAuth({ sync: 'saved', lastSyncedAt: Date.now() });
        return;
      }
      const res = await rpc('save_my_state', { p_data: final, p_expected_rev: server.rev });
      if (res.ok) {
        st.setSyncMeta({ userId: user.id, rev: res.rev, base: final });
        setAuth({ sync: 'saved', lastSyncedAt: Date.now() });
        return;
      }
      if (res.blocked) { setAuth({ sync: 'blocked' }); return; }
      // Someone else saved first (another device): loop to merge with their copy.
    }
    setAuth({ sync: 'error' });
  } catch (e) {
    console.warn('[sync] failed:', e?.message);
    setAuth({ sync: isOffline() ? 'offline' : 'error' });
  }
}

// Is there progress on this device that the account does not have yet? (The "saved" label can lag a change by a
// moment, so anything that must not lose progress, like signing out, asks this instead.)
export function hasUnsaved() {
  const st = store();
  if (!st.user) return false;
  if (!consentAllowsSync(st.user)) return true;
  const base = st.syncMeta && st.syncMeta.userId === st.user.id ? st.syncMeta.base : null;
  return !base || docHash(pickDoc(st)) !== docHash(base);
}

// Save shortly after the student's progress changes.
function startAutoSync() {
  let timer = null;
  let lastHash = null;
  const unsub = useStore.subscribe((state, prev) => {
    if (!consentAllowsSync(state.user)) return;
    if (!SYNC_KEYS.some((k) => state[k] !== prev[k])) return; // toasts, sheets and the like do not matter
    const h = docHash(pickDoc(state));
    if (h === lastHash) return;
    lastHash = h;
    clearTimeout(timer);
    timer = setTimeout(syncNow, 1500);
  });
  return () => { unsub(); clearTimeout(timer); };
}

// ---------------------------------------------------------------------------
// Where to go after signing in
// ---------------------------------------------------------------------------
export async function afterSignIn(user, navigate) {
  if (!consentAllowsSync(user)) { navigate(user.consent === 'required' ? '/guardian' : '/', { replace: true }); return; }
  const st = store();
  // Progress made on this device as a guest (or by someone else) is the student's to keep or drop.
  if (st.hasGuestData() && st.syncMeta?.userId !== user.id) { navigate('/merge', { replace: true }); return; }
  await syncNow();
  navigate(store().quiz.completedAt ? '/' : '/quiz', { replace: true });
}

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
function cleanAuthParams() {
  const u = new URL(location.href);
  let dirty = false;
  for (const k of ['code', 'error', 'error_code', 'error_description']) if (u.searchParams.has(k)) { u.searchParams.delete(k); dirty = true; }
  if (dirty) history.replaceState(null, '', u.pathname + u.search + u.hash);
}

export async function initAuth(navigate) {
  const st = store();
  if (!supabase) {
    if (st.user) st.setAccount(null); // an account left over from the old simulated sign-in
    setAuth({ status: 'out' });
    return () => {};
  }

  const params = new URLSearchParams(location.search);
  if (params.get('error')) {
    try { sessionStorage.removeItem(INTENT_KEY); } catch { /* ignore */ }
    st.pushToast('Google sign-in did not finish. You can try again, or keep exploring as a guest.', 'info');
    track('auth_cancelled');
  }

  let handledFor = null;
  const onSession = async (session) => {
    if (!session) {
      handledFor = null;
      setAuth({ status: 'out', sync: 'idle' });
      if (store().user) store().setAccount(null); // session ended: keep the progress on the device, drop the account link
      return;
    }
    handledFor = session.user.id;
    setAuth({ status: 'in' });
    let profile;
    try { profile = await rpc('my_profile'); } catch (e) { console.warn('[auth] could not load profile:', e?.message); return; }
    // The flag says "this page load is the return from Google". It is used up here, in every case, so a later reload
    // is never mistaken for a sign-in and does not redirect the student.
    let intent = false;
    try { intent = sessionStorage.getItem(INTENT_KEY) === '1'; sessionStorage.removeItem(INTENT_KEY); } catch { /* ignore */ }
    if (!profile) { if (intent) navigate('/about', { replace: true }); return; } // new student: choose a nickname and class
    const user = toUser(profile);
    store().setAccount(user);
    if (intent) {
      track('auth_success', { method: 'google' });
      await afterSignIn(user, navigate);
    } else {
      syncNow();
    }
  };

  const { data } = await supabase.auth.getSession(); // also completes the Google return (?code=) if present
  cleanAuthParams();
  await onSession(data.session);

  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    // Never call Supabase from inside this callback: hand over to the next tick.
    if (event === 'SIGNED_OUT') setTimeout(() => onSession(null), 0);
    else if (event === 'SIGNED_IN' && session?.user?.id !== handledFor) setTimeout(() => onSession(session), 0);
  });
  const stopAuto = startAutoSync();
  return () => { sub.subscription.unsubscribe(); stopAuto(); };
}
