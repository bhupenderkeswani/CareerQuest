// App state. In this prototype everything lives on the device (localStorage); a real build
// keeps the same shape but syncs to the Phase 2 backend for signed-in users.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useMemo, useState } from 'react';
import { CAREER_MAP, TOP_SALARY_IDS } from './data/careers';
import { SEED_QUEUE } from './data/admin';
import { DAILY_CAP, XP_RULES, levelInfo } from './lib/config';
import { SYNC_KEYS } from './lib/sync';
import { BADGES } from './lib/badges';
import { track } from './lib/analytics';
import { today } from './lib/freshness';

const freshDaily = (date = today()) => ({ date, xp: 0, counts: {}, keys: {}, capShown: false });

const freshData = () => ({
  entered: false,
  user: null,       // the signed-in student's profile (from the server); null for guests
  syncMeta: null,   // { userId, rev, base }: the copy last agreed with the server, for three-way merging
  xp: 0,
  daily: freshDaily(),
  once: {},
  eventsLog: [],
  stats: {
    opened: [], fields: [], sideQuests: [], dailyQuests: [], fieldInfo: [],
    shares: 0, saved: 0, learned: 0, compare3: false, outsideOpened: false, quizDone: false, reportAccepted: false,
  },
  badges: {},
  levelSeen: 1,
  shortlist: [],
  compare: [],
  quiz: { answers: {}, step: 0, completedAt: null },
  recs: [],
  progress: {},
  startStage: 1,
  activePath: {},
  reports: [],
  learnedFor: {},
  notif: { roleUpdates: false },
  overrides: {},
  adminDecisions: {},
  lastSynced: Date.now(),
  pendingSync: 0,
});

const freshUi = () => ({
  toasts: [], badgeQueue: [], levelUp: null, capNote: false, guestPrompt: null,
  simOffline: false, info: null, report: null,
});

// Progress that belongs to the student, as opposed to identity/settings.
const progressKeys = ['xp', 'daily', 'once', 'eventsLog', 'stats', 'badges', 'levelSeen', 'shortlist', 'compare', 'quiz', 'recs', 'progress', 'learnedFor', 'reports'];

let toastId = 0;

export const useStore = create(
  persist(
    (set, get) => {
      const uiSet = (p) => set((s) => ({ ui: { ...s.ui, ...(typeof p === 'function' ? p(s.ui) : p) } }));
      const toast = (text, kind = 'xp') => {
        const id = ++toastId;
        uiSet((u) => ({ toasts: [...u.toasts.slice(-1), { id, text, kind }] }));
      };
      const isOffline = () => !navigator.onLine || get().ui.simOffline;

      // At most one soft account prompt per session, and only for guests (design principle 1).
      const maybePrompt = (kind) => {
        if (get().user) return;
        try {
          if (sessionStorage.getItem('cq_prompted')) return;
          sessionStorage.setItem('cq_prompted', '1');
        } catch { /* storage blocked: skip the prompt rather than nag */ }
        uiSet({ guestPrompt: kind });
      };

      const checkBadges = () => {
        const s = get();
        const next = { ...s.badges };
        const fresh = [];
        for (const b of BADGES) {
          if (!next[b.id] && b.progress(s) >= b.target) { next[b.id] = Date.now(); fresh.push(b.id); }
        }
        if (!fresh.length) return;
        set({ badges: next });
        uiSet((u) => ({ badgeQueue: [...u.badgeQueue, ...fresh] }));
        fresh.forEach((id) => track('badge_unlock', { badge: id }));
        if (Object.keys(s.badges).length === 0) maybePrompt('badge');
      };

      const bump = (fn) => set((s) => ({ stats: { ...s.stats, ...fn(s.stats, s) } }));
      const addUnique = (arr, v) => (arr.includes(v) ? arr : [...arr, v]);

      // The XP engine. Returns XP actually granted. Repeats and capped actions are silent.
      const grant = (action, key = '') => {
        const s = get();
        const rule = XP_RULES[action];
        const date = today();
        let daily = s.daily.date === date ? s.daily : freshDaily(date);
        const bail = () => { if (daily !== s.daily) set({ daily }); return 0; };

        if (rule.lifetime && (s.once[action] || []).includes(key)) return bail();
        if (rule.dailyLimit && (daily.counts[action] || 0) >= rule.dailyLimit) return bail();
        if (rule.uniquePerDay && (daily.keys[action] || []).includes(key)) return bail();

        const room = DAILY_CAP - daily.xp;
        if (room <= 0) {
          // Not consumed, so a lifetime action can still earn on a later day.
          if (!daily.capShown) { daily = { ...daily, capShown: true }; set({ daily }); uiSet({ capNote: true }); return 0; }
          return bail();
        }

        const gained = Math.min(rule.xp, room);
        daily = {
          ...daily,
          xp: daily.xp + gained,
          counts: { ...daily.counts, [action]: (daily.counts[action] || 0) + 1 },
          keys: rule.uniquePerDay ? { ...daily.keys, [action]: addUnique(daily.keys[action] || [], key) } : daily.keys,
        };
        const xp = s.xp + gained;
        set({
          xp,
          daily,
          once: rule.lifetime ? { ...s.once, [action]: [...(s.once[action] || []), key] } : s.once,
          eventsLog: [...s.eventsLog.slice(-99), { action, key, xp: gained, t: Date.now() }],
        });
        toast(`+${gained} XP`);
        track('xp_awarded', { action, xp: gained });

        const lvl = levelInfo(xp);
        if (lvl.n > s.levelSeen) {
          set({ levelSeen: lvl.n });
          uiSet({ levelUp: lvl.n });
          track('level_up', { level: lvl.n });
        }
        if (daily.xp >= DAILY_CAP && !daily.capShown) {
          set({ daily: { ...daily, capShown: true } });
          uiSet({ capNote: true });
        }
        return gained;
      };

      return {
        ...freshData(),
        ui: freshUi(),

        // ---------- onboarding & account (US10, US19)
        enterGuest: () => { set({ entered: true }); track('guest_continue'); },
        // The signed-in student's profile. Accounts come from Google sign-in (see lib/account.js).
        setAccount: (user) => set(user ? { user, entered: true } : { user: null }),
        setSyncMeta: (syncMeta) => set({ syncMeta }),
        // Take a merged copy from the server (or a merge of both). Missing parts fall back to fresh defaults.
        applyDoc: (doc) => {
          const f = freshData();
          const patch = Object.fromEntries(SYNC_KEYS.map((k) => [k, doc[k] ?? f[k]]));
          patch.stats = { ...f.stats, ...(doc.stats || {}) };
          set(patch);
        },
        hasGuestData: () => {
          const s = get();
          return s.shortlist.length > 0 || s.xp > 0 || Object.keys(s.badges).length > 0;
        },
        mergeAccept: () => track('merge_accepted'),
        mergeFresh: () => {
          const f = freshData();
          set(Object.fromEntries(progressKeys.map((k) => [k, f[k]])));
        },
        // Sign-out takes the student's progress off this device: it lives in their account.
        clearAccount: () => {
          const f = freshData();
          set({ user: null, entered: false, syncMeta: null, ...Object.fromEntries([...progressKeys, 'notif', 'startStage', 'activePath'].map((k) => [k, f[k]])) });
        },
        exportData: () => {
          const s = get();
          const out = { exportedAt: new Date().toISOString(), note: 'Prototype export: all data from this device.' };
          ['user', ...progressKeys, 'notif', 'startStage'].forEach((k) => { out[k] = s[k]; });
          return out;
        },
        deleteAccount: () => {
          set({ ...freshData(), ui: freshUi() });
          try { localStorage.removeItem('cq_events_v1'); sessionStorage.removeItem('cq_prompted'); } catch { /* ignore */ }
          track('account_deleted');
        },

        // ---------- learning actions (US11–US13)
        openCard: (roleId) => {
          const role = CAREER_MAP[roleId];
          if (!role) return;
          const s = get();
          grant('open_card', roleId);
          const rec = s.recs.find((r) => r.roleId === roleId);
          bump((st) => ({
            opened: addUnique(st.opened, roleId),
            fields: addUnique(st.fields, role.field),
            outsideOpened: st.outsideOpened || Boolean(rec && rec.outside),
          }));
          checkBadges();
          track('card_open', { role: roleId, topSalary: TOP_SALARY_IDS.includes(roleId) });
        },
        expandDailyQuest: (roleId) => {
          grant('dailyquest', roleId);
          bump((st) => ({ dailyQuests: addUnique(st.dailyQuests, roleId) }));
          checkBadges();
          track('dailyquest_expand', { role: roleId });
        },
        viewSideQuest: (roleId, to) => {
          const key = `${roleId}>${to}`;
          grant('sidequest', key);
          bump((st) => ({ sideQuests: addUnique(st.sideQuests, key) }));
          checkBadges();
          track('sidequest_view', { role: roleId, to });
        },
        viewCompare: (ids) => {
          if (ids.length < 2) return;
          grant('compare', 'compare');
          if (ids.length >= 3) bump(() => ({ compare3: true }));
          checkBadges();
          track('compare_view', { n: ids.length });
        },
        completeStep: (roleId, stepId) => {
          const s = get();
          if (s.progress[roleId]?.[stepId]) return;
          set({ progress: { ...s.progress, [roleId]: { ...(s.progress[roleId] || {}), [stepId]: Date.now() } } });
          if (isOffline()) set((st) => ({ pendingSync: st.pendingSync + 1 }));
          grant('roadmap_step', `${roleId}:${stepId}`);
          checkBadges();
          track('roadmap_step_complete', { role: roleId, step: stepId });
        },
        undoStep: (roleId, stepId) => {
          const s = get();
          const mine = { ...(s.progress[roleId] || {}) };
          delete mine[stepId];
          set({ progress: { ...s.progress, [roleId]: mine } });
          if (isOffline()) set((st) => ({ pendingSync: st.pendingSync + 1 }));
        },
        recordShare: (roleId) => {
          grant('share', roleId);
          bump((st) => ({ shares: st.shares + 1 }));
          checkBadges();
          track('share', { role: roleId });
        },
        answerLearned: (roleId, yes) => {
          if (get().learnedFor[roleId]) return;
          set((s) => ({ learnedFor: { ...s.learnedFor, [roleId]: yes ? 'yes' : 'no' } }));
          grant('learned', roleId);
          bump(() => ({ learned: Object.keys(get().learnedFor).length }));
          checkBadges();
          track('learned_new', { answer: yes ? 'yes' : 'no' });
        },
        openFieldInfo: (key) => {
          bump((st) => ({ fieldInfo: addUnique(st.fieldInfo, key) }));
          checkBadges();
          track('field_info_open');
        },

        // ---------- shortlist & compare
        toggleShortlist: (roleId) => {
          const s = get();
          const has = s.shortlist.includes(roleId);
          const next = has ? s.shortlist.filter((r) => r !== roleId) : [...s.shortlist, roleId];
          set({ shortlist: next });
          bump((st) => ({ saved: Math.max(st.saved, next.length) }));
          checkBadges();
          if (!has && next.length === 3) maybePrompt('shortlist');
          track('shortlist_toggle', { role: roleId, saved: !has });
        },
        toggleCompare: (roleId) => {
          const c = get().compare;
          if (c.includes(roleId)) { set({ compare: c.filter((r) => r !== roleId) }); return true; }
          if (c.length >= 3) return false;
          set({ compare: [...c, roleId] });
          return true;
        },
        setCompare: (ids) => set({ compare: ids.slice(0, 3) }),
        clearCompare: () => set({ compare: [] }),

        // ---------- quiz & recommendations (US14, US15)
        saveQuizProgress: (answers, step) => set((s) => ({ quiz: { ...s.quiz, answers, step } })),
        completeQuiz: (answers, recs) => {
          set((s) => ({ quiz: { answers, step: 0, completedAt: Date.now() }, recs }));
          bump(() => ({ quizDone: true }));
          grant('quiz', 'quiz');
          checkBadges();
          maybePrompt('quiz');
          track('quiz_complete');
        },
        resetQuiz: () => set({ quiz: { answers: {}, step: 0, completedAt: null }, recs: [] }),
        setRecFeedback: (roleId, value) => {
          set((s) => ({ recs: s.recs.map((r) => (r.roleId === roleId ? { ...r, feedback: r.feedback === value ? null : value } : r)) }));
          track('rec_feedback', { value });
        },

        // ---------- roadmaps
        setStartStage: (i) => set({ startStage: i }),
        setActivePath: (roleId, pathId) => set((s) => ({ activePath: { ...s.activePath, [roleId]: pathId } })),

        // ---------- data trust (US17)
        openInfo: (payload) => uiSet({ info: payload }),
        closeInfo: () => uiSet({ info: null }),
        openReport: (payload) => { uiSet({ report: payload, info: null }); },
        closeReport: () => uiSet({ report: null }),
        // The id is a random uuid that stays on the device: it is how the reporter later checks the
        // outcome without signing in. `synced` flips once the report reaches the database.
        submitReport: ({ roleId, field, text }) => {
          const id = crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
          const item = { id, roleId, field, text, date: Date.now(), synced: false, status: 'pending' };
          set((s) => ({ reports: [...s.reports, item] }));
          track('error_report_submit', { field });
          return id;
        },
        markReportsSynced: (ids) => set((s) => ({ reports: s.reports.map((r) => (ids.includes(r.id) ? { ...r, synced: true } : r)) })),
        setReportStatus: (id, status) => {
          const s = get();
          const r = s.reports.find((x) => x.id === id);
          if (!r || r.status === status) return;
          set({ reports: s.reports.map((x) => (x.id === id ? { ...x, status } : x)) });
          if (status === 'approved' && !s.stats.reportAccepted) {
            bump(() => ({ reportAccepted: true }));
            toast('Your error report was accepted. Thank you!', 'info');
            checkBadges();
          } else if (status === 'rejected') {
            toast('We checked your report and kept the number as it is. Thanks for looking.', 'info');
          }
        },
        adminDecide: (id, decision) => {
          const s = get();
          const seeded = SEED_QUEUE.find((q) => q.id === id);
          const report = s.reports.find((r) => r.id === id);
          set({ adminDecisions: { ...s.adminDecisions, [id]: decision } });
          if (decision !== 'approved') return;
          if (seeded) {
            set((st) => ({
              overrides: { ...st.overrides, [`${seeded.roleId}.${seeded.field}`]: { value: seeded.next, updated: new Date().toISOString(), source: seeded.source } },
            }));
          }
          if (report) {
            // On a real backend the reporter gets a notification; here it is the same device.
            bump(() => ({ reportAccepted: true }));
            toast('Your error report was accepted. Thank you!', 'info');
            checkBadges();
          }
        },

        // ---------- settings, offline, UI plumbing
        setNotif: (key, value) => { set((s) => ({ notif: { ...s.notif, [key]: value } })); if (value) track('notif_optin', { key }); },
        setSimOffline: (v) => uiSet({ simOffline: v }),
        markSynced: () => set({ lastSynced: Date.now(), pendingSync: 0 }),
        dismissToast: (id) => uiSet((u) => ({ toasts: u.toasts.filter((t) => t.id !== id) })),
        popBadge: () => uiSet((u) => ({ badgeQueue: u.badgeQueue.slice(1) })),
        dismissLevelUp: () => uiSet({ levelUp: null }),
        dismissCapNote: () => uiSet({ capNote: false }),
        dismissGuestPrompt: () => uiSet({ guestPrompt: null }),
        pushToast: toast,
      };
    },
    {
      name: 'cq_state_v1',
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([k, v]) => k !== 'ui' && typeof v !== 'function')),
    },
  ),
);

// A role with any approved field updates applied on top of the curated base.
export function withOverrides(role, overrides) {
  if (!role) return role;
  let fields = role.fields;
  for (const k of Object.keys(fields)) {
    const o = overrides[`${role.id}.${k}`];
    if (o) fields = { ...fields, [k]: { ...fields[k], value: o.value, updated: o.updated, source: o.source } };
  }
  return fields === role.fields ? role : { ...role, fields };
}

export function useRole(id) {
  const overrides = useStore((s) => s.overrides);
  return useMemo(() => withOverrides(CAREER_MAP[id], overrides), [id, overrides]);
}

export function useRoles(ids) {
  const overrides = useStore((s) => s.overrides);
  const key = ids.join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ids.map((id) => withOverrides(CAREER_MAP[id], overrides)).filter(Boolean), [key, overrides]);
}

export const SEEDED_QUEUE = SEED_QUEUE;

// Online state that also honours the "simulate offline" demo switch.
export function useOnline() {
  const sim = useStore((s) => s.ui.simOffline);
  return useBrowserOnline() && !sim;
}

function useBrowserOnline() {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOn(true);
    const down = () => setOn(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  return on;
}
