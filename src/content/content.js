// Content loading: Supabase when configured, with an on-device cache and the bundled sample data
// as fallbacks.
//
//   first ever visit : wait up to 2.5 s for the network, else start on the bundled data
//   later visits     : start instantly from the cache, refresh in the background
//   offline          : the last cache (cards you have opened keep working, S23)
//
// The data modules are swapped in place, so a background refresh that changes anything bumps
// `version`, which remounts the screen once. Identical content never causes a remount.
import { create } from 'zustand';
import { supabase, isConfigured } from '../lib/supabase';
import { useStore } from '../store';
import { assemble } from './assemble';
import { replaceCareers } from '../data/careers';
import { replaceRoadmaps } from '../data/roadmaps';
import { replaceLadders } from '../data/ladders';
import { replaceQuestions } from '../data/quiz';

const CACHE_KEY = 'cq_content_v1';
const FIRST_LOAD_WAIT_MS = 2500;
const FETCH_TIMEOUT_MS = 10000;

// source: bundled | cache | network
export const useContent = create(() => ({ source: 'bundled', fetchedAt: null, version: 0, loading: true, error: null, dropped: [] }));

let appliedSig = null;
let initPromise = null;

// Same content = same signature, regardless of the generated_at timestamp.
function signature(snap) {
  const { generated_at, ...rest } = snap; // eslint-disable-line no-unused-vars
  const s = JSON.stringify(rest);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${s.length}:${h}`;
}

function applySnapshot(snap, source, fetchedAt) {
  const content = assemble(snap);
  if (!content.careers.length) throw new Error('Snapshot has no usable careers');
  const sig = signature(snap);
  const changed = sig !== appliedSig;
  if (changed) {
    replaceCareers(content.careers);
    replaceRoadmaps(content.roadmaps);
    replaceLadders(content.ladders);
    if (content.quiz) replaceQuestions(content.quiz.questions, content.quiz.version);
    appliedSig = sig;
  }
  useContent.setState((s) => ({ source, fetchedAt, error: null, dropped: content.dropped, version: changed ? s.version + 1 : s.version }));
  if (content.dropped.length) console.warn('[content] skipped incomplete rows:', content.dropped);
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
}
function writeCache(snapshot, fetchedAt) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ snapshot, fetchedAt })); } catch { /* quota or blocked: cache is optional */ }
}

const isOffline = () => !navigator.onLine || useStore.getState().ui.simOffline;

export async function refreshContent() {
  if (!supabase) return { ok: false, reason: 'not-configured' };
  if (isOffline()) return { ok: false, reason: 'offline' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const { data, error } = await supabase.rpc('content_snapshot').abortSignal(ctrl.signal);
    if (error) throw error;
    const fetchedAt = Date.now();
    applySnapshot(data, 'network', fetchedAt);
    writeCache(data, fetchedAt);
    return { ok: true };
  } catch (e) {
    // A browser reports an unreachable or wrong host as a bare "Failed to fetch" (often labelled CORS).
    const message = e?.name === 'AbortError' ? 'The request timed out'
      : /failed to fetch|networkerror|load failed/i.test(e?.message || '') ? 'Could not reach Supabase. Check VITE_SUPABASE_URL, that the project is not paused, and your connection'
      : e?.message || String(e);
    useContent.setState({ error: message });
    console.warn('[content] refresh failed, keeping what we have:', message);
    return { ok: false, reason: message };
  } finally {
    clearTimeout(timer);
  }
}

export function initContent() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!isConfigured) { useContent.setState({ loading: false, source: 'bundled' }); return; }
    const cache = readCache();
    let fromCache = false;
    if (cache?.snapshot) {
      try { applySnapshot(cache.snapshot, 'cache', cache.fetchedAt); fromCache = true; } catch { try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ } }
    }
    const fresh = refreshContent();
    if (!fromCache) await Promise.race([fresh, new Promise((r) => setTimeout(r, FIRST_LOAD_WAIT_MS))]);
    useContent.setState({ loading: false });
  })();
  return initPromise;
}
