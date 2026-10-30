// Progress sync: which parts of the app state follow a student's account, and how two copies
// (this device, the server) are merged. PURE, with no imports, so it is easy to test.
//
// Rules of the merge, chosen so a student never loses progress:
//   * counters (XP, level shown) keep the larger value
//   * things that only grow (badges, "once" XP keys, opened roles) are unioned
//   * lists a student can edit (shortlist, roadmap steps) are merged THREE ways against the last
//     synced copy, so removing something on one device is not undone by the other device
//   * single settings (quiz answers, notifications, start stage) take whichever side changed since
//     the last sync, and this device wins if both did
// Anti-cheat is not a goal: there are no leaderboards, prizes or payments tied to XP.

export const SYNC_KEYS = ['xp', 'daily', 'once', 'stats', 'badges', 'levelSeen', 'shortlist', 'quiz', 'recs', 'progress', 'learnedFor', 'notif', 'startStage', 'activePath'];

export function emptyDoc() {
  return {
    v: 1, xp: 0, daily: null, once: {}, stats: {}, badges: {}, levelSeen: 1, shortlist: [],
    quiz: { answers: {}, step: 0, completedAt: null }, recs: [], progress: {}, learnedFor: {},
    notif: { roleUpdates: false }, startStage: 1, activePath: {},
  };
}

export function pickDoc(state) {
  const doc = { v: 1 };
  for (const k of SYNC_KEYS) doc[k] = state[k];
  return doc;
}

// Key order must not matter, or two identical copies would look different.
export function stable(v) {
  return JSON.stringify(v, (_k, val) => (val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).sort().reduce((o, key) => { o[key] = val[key]; return o; }, {})
    : val));
}
export const same = (a, b) => stable(a ?? null) === stable(b ?? null);

export function docHash(doc) {
  const s = stable(doc);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${s.length}:${h}`;
}

// ---- building blocks ----
const union = (a = [], b = []) => [...new Set([...a, ...b])];

// Three-way set merge: additions from either side are kept; an item removed on either side
// (present in base, absent from that side) stays removed.
export function set3(base = [], a = [], b = []) {
  const removed = new Set([...base.filter((x) => !a.includes(x)), ...base.filter((x) => !b.includes(x))]);
  return union(a, b).filter((x) => !removed.has(x));
}

// A single value: take the side that changed since the last sync; this device wins if both did.
export const pick3 = (base, a, b) => (same(a, base) ? b : same(b, base) ? a : a);

function mergeDaily(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  if (a.date !== b.date) return a.date > b.date ? a : b;
  const counts = {}; const keys = {};
  for (const k of union(Object.keys(a.counts || {}), Object.keys(b.counts || {}))) counts[k] = Math.max(a.counts?.[k] || 0, b.counts?.[k] || 0);
  for (const k of union(Object.keys(a.keys || {}), Object.keys(b.keys || {}))) keys[k] = union(a.keys?.[k], b.keys?.[k]);
  return { date: a.date, xp: Math.max(a.xp || 0, b.xp || 0), counts, keys, capShown: Boolean(a.capShown || b.capShown) };
}

function mergeOnce(a = {}, b = {}) {
  const out = {};
  for (const k of union(Object.keys(a), Object.keys(b))) out[k] = union(a[k], b[k]);
  return out;
}

function mergeStats(a = {}, b = {}) {
  const out = {};
  for (const k of union(Object.keys(a), Object.keys(b))) {
    const x = a[k], y = b[k];
    if (Array.isArray(x) || Array.isArray(y)) out[k] = union(x, y);
    else if (typeof x === 'number' || typeof y === 'number') out[k] = Math.max(x || 0, y || 0);
    else out[k] = Boolean(x || y);
  }
  return out;
}

function mergeBadges(a = {}, b = {}) {
  const out = { ...b };
  for (const [k, t] of Object.entries(a)) out[k] = k in out ? Math.min(out[k], t) : t;
  return out;
}

function mergeProgress(base = {}, a = {}, b = {}) {
  const out = {};
  for (const role of union(Object.keys(a), Object.keys(b))) {
    const ids = set3(Object.keys(base[role] || {}), Object.keys(a[role] || {}), Object.keys(b[role] || {}));
    const steps = {};
    for (const id of ids) steps[id] = Math.min(...[a[role]?.[id], b[role]?.[id]].filter((t) => t != null));
    if (Object.keys(steps).length) out[role] = steps;
  }
  return out;
}

// merge3(base, local, server): `base` is the copy both sides last agreed on (null before the first sync).
export function merge3(base, local, server) {
  const B = { ...emptyDoc(), ...(base || {}) };
  const a = { ...emptyDoc(), ...local };
  const b = { ...emptyDoc(), ...server };
  const quizPair = pick3({ quiz: B.quiz, recs: B.recs }, { quiz: a.quiz, recs: a.recs }, { quiz: b.quiz, recs: b.recs });
  return {
    v: 1,
    xp: Math.max(a.xp || 0, b.xp || 0),
    levelSeen: Math.max(a.levelSeen || 1, b.levelSeen || 1),
    daily: mergeDaily(a.daily, b.daily),
    once: mergeOnce(a.once, b.once),
    stats: mergeStats(a.stats, b.stats),
    badges: mergeBadges(a.badges, b.badges),
    shortlist: set3(B.shortlist, a.shortlist, b.shortlist),
    progress: mergeProgress(B.progress, a.progress, b.progress),
    learnedFor: { ...b.learnedFor, ...a.learnedFor },
    quiz: quizPair.quiz,
    recs: quizPair.recs,
    notif: pick3(B.notif, a.notif, b.notif),
    startStage: pick3(B.startStage, a.startStage, b.startStage),
    activePath: pick3(B.activePath, a.activePath, b.activePath),
  };
}
