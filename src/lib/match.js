// The matching engine shared by three callers: the quiz, the chat on the device (quick matches),
// and the Edge Function (the AI path). It is PURE: it takes the content as an argument and imports
// nothing from src/data, so the same file can be bundled into the function.
//
// Rules that must hold everywhere (spec 5.4):
//   * only roles that exist in the curated content can be returned
//   * every figure shown comes from a card or ladder, never from a model
//   * pay is a FILTER, never a ranking key (counter-metric: students opening only top-pay roles)
//   * inputs never include caste, religion, gender or family income

export const VOCAB = {
  subjects: ['maths', 'science', 'computers', 'commerce', 'languages', 'social'],
  style: ['people', 'data', 'hands', 'creative'],
  interests: ['tech', 'helping', 'business', 'design', 'puzzles', 'health'],
  avoid: ['longStudy', 'exams', 'relocation', 'desk', 'clinical', 'maths'],
  fields: ['tech', 'health', 'business'],
};

export const LABELS = {
  maths: 'maths', science: 'science', computers: 'computers', commerce: 'accounts and economics',
  languages: 'languages and writing', social: 'social science',
  people: 'working with people', data: 'working with data', hands: 'hands-on work', creative: 'creating and designing',
  tech: 'technology', helping: 'helping people', business: 'money and business', design: 'design and media',
  puzzles: 'solving puzzles', health: 'health and the body',
  longStudy: 'very long study', exams: 'heavy entrance exams', relocation: 'moving far from home', desk: 'desk-based work',
  clinical: 'working with patients or blood',
};

const FIELD_LABELS = { tech: 'Tech', health: 'Health', business: 'Business' };

// ---------------------------------------------------------------------------
// Pay text -> numbers. The text on the card is the single source of truth; this reads it.
// "₹4–9 LPA" -> 4..9    "₹80 L–1.5 Cr" -> 80..150    stipends and "varies widely" -> null
// ---------------------------------------------------------------------------
export function parsePayLpa(text) {
  if (!text) return null;
  if (/stipend|a month|per month/i.test(text)) return null; // monthly stipends are not comparable with annual pay
  const m = /₹\s*(\d+(?:\.\d+)?)\s*(L|Cr|LPA)?\s*[–-]\s*(\d+(?:\.\d+)?)\s*(L|Cr|LPA)(?![A-Za-z])/i.exec(text);
  if (!m) return null;
  const factor = (u) => (u.toLowerCase() === 'cr' ? 100 : 1);
  return { min: +m[1] * factor(m[2] || m[4]), max: +m[3] * factor(m[4]) };
}

// ---------------------------------------------------------------------------
// Scoring (moved from the quiz recommender so both front doors share it)
// ---------------------------------------------------------------------------
export function scoreRole(role, a) {
  const t = role.tags;
  const hit = (mine, theirs) => (mine || []).filter((v) => theirs.includes(v));
  const subjects = hit(a.subjects, t.subjects);
  const style = hit(a.style, t.style);
  const interests = hit(a.interests, t.interests);
  let s = subjects.length * 2 + style.length * 2 + interests.length * 1.5;
  const gaps = [];

  const check = (need, have, weight, gap) => {
    if (have == null) return;
    if (need > have) { s -= (need - have) * weight; gaps.push(gap); } else s += 0.4;
  };
  check(t.exams, a.exams, 2.5, 'exam');
  check(t.years, a.years, 2.5, 'years');
  check(t.cost, a.budget, 2.5, 'cost');
  check(t.reloc, a.reloc, 2, 'reloc');

  const avoided = (a.avoid || []).filter((f) => t.flags.includes(f));
  s -= avoided.length * 6;
  return { s, subjects, style, interests, gaps, avoided };
}

export function joinList(arr) {
  const names = arr.map((v) => LABELS[v] || v);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Filters: what the student asked for, as data. The AI (or the keyword fallback) fills this in.
// ---------------------------------------------------------------------------
export const emptyFilters = () => ({
  min_salary_lpa: null, subjects: [], style: [], interests: [], avoid: [],
  field: null, exams: null, years: null, budget: null, reloc: null, named_roles: [],
});

const tier = (v) => (Number.isInteger(v) && v >= 0 && v <= 2 ? v : null);

// Whatever a model (or a client) sends, only known values survive. This is the guardrail that keeps
// caste, religion, gender, income or invented fields out: there is simply no slot for them.
export function sanitizeFilters(raw, knownIds = null) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const pick = (arr, allowed) => [...new Set((Array.isArray(arr) ? arr : []).filter((x) => allowed.includes(x)))];
  const pay = Number(r.min_salary_lpa);
  return {
    min_salary_lpa: Number.isFinite(pay) && pay > 0 && pay <= 1000 ? Math.round(pay * 10) / 10 : null,
    subjects: pick(r.subjects, VOCAB.subjects),
    style: pick(r.style, VOCAB.style),
    interests: pick(r.interests, VOCAB.interests),
    avoid: pick(r.avoid, VOCAB.avoid),
    field: VOCAB.fields.includes(r.field) ? r.field : null,
    exams: tier(r.exams), years: tier(r.years), budget: tier(r.budget), reloc: tier(r.reloc),
    named_roles: knownIds ? pick(r.named_roles, knownIds).slice(0, 3) : [],
  };
}

// A follow-up adds to what was said before. Lists accumulate, single values are replaced.
export function mergeFilters(prev, next) {
  const p = prev || emptyFilters();
  const union = (a, b) => [...new Set([...(a || []), ...(b || [])])];
  return {
    min_salary_lpa: next.min_salary_lpa ?? p.min_salary_lpa,
    subjects: union(p.subjects, next.subjects),
    style: union(p.style, next.style),
    interests: union(p.interests, next.interests),
    avoid: union(p.avoid, next.avoid),
    field: next.field ?? p.field,
    exams: next.exams ?? p.exams, years: next.years ?? p.years, budget: next.budget ?? p.budget, reloc: next.reloc ?? p.reloc,
    named_roles: next.named_roles || [], // asking about a named role is about that turn only
  };
}

export function hasSignal(f) {
  return f.min_salary_lpa != null || f.field || f.named_roles.length > 0 ||
    f.subjects.length + f.style.length + f.interests.length + f.avoid.length > 0 ||
    [f.exams, f.years, f.budget, f.reloc].some((v) => v != null);
}

// ---- chips: "Understood: ≥ ₹20 LPA · Maths", each one removable ----
const TIER_CHIPS = {
  exams: ['Happy to prepare hard for exams', 'Fine with exams if needed', 'Avoid entrance exams'],
  years: ['Happy to study long', 'A few years of study', 'Start earning early'],
  budget: ['Low study budget', 'Medium study budget', 'Higher study budget is okay'],
  reloc: ['Prefer to stay near home', 'Maybe move', 'Happy to move'],
};
// tiers are 0 (low) .. 2 (high); the label arrays above are ordered high -> low for exams/years, so index by 2 - v
const tierLabel = (key, v) => (key === 'exams' || key === 'years' ? TIER_CHIPS[key][2 - v] : TIER_CHIPS[key][v]);

export function describeFilters(f) {
  const chips = [];
  if (f.min_salary_lpa != null) chips.push({ id: 'salary', label: `Pay of ₹${f.min_salary_lpa} LPA or more` });
  if (f.field) chips.push({ id: 'field', label: FIELD_LABELS[f.field] });
  for (const k of ['subjects', 'style', 'interests']) for (const v of f[k]) chips.push({ id: `${k}:${v}`, label: LABELS[v][0].toUpperCase() + LABELS[v].slice(1) });
  for (const k of ['exams', 'years', 'budget', 'reloc']) if (f[k] != null) chips.push({ id: k, label: tierLabel(k, f[k]) });
  for (const v of f.avoid) chips.push({ id: `avoid:${v}`, label: `Not ${LABELS[v]}` });
  return chips;
}

export function removeChip(f, id) {
  const next = { ...f, subjects: [...f.subjects], style: [...f.style], interests: [...f.interests], avoid: [...f.avoid] };
  if (id === 'salary') next.min_salary_lpa = null;
  else if (id === 'field') next.field = null;
  else if (['exams', 'years', 'budget', 'reloc'].includes(id)) next[id] = null;
  else {
    const [k, v] = id.split(':');
    next[k] = next[k].filter((x) => x !== v);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Keyword extraction: the fallback when no model is available, and the only path for students who
// choose "quick match only" (nothing they type leaves the device). Deliberately modest.
// ---------------------------------------------------------------------------
const NEG = '(?:hate|hates|dislike|avoid|bad at|weak in|weak at|not good at|no|not into|scared of|afraid of|can\'t stand|don\'t like|do not like)';
const KEYWORDS = {
  subjects: {
    maths: /\bmath(?:s|ematics)?\b/, science: /\b(?:science|physics|chemistry|biology|bio)\b/, computers: /\b(?:computers?|coding|programming|cs)\b/,
    commerce: /\b(?:commerce|accounts?|accounting|economics)\b/, languages: /\b(?:english|hindi|languages?|writing|literature)\b/, social: /\b(?:history|civics|geography|social science|politics)\b/,
  },
  style: {
    people: /\b(?:people|team|talking|communicat\w*|customers?)\b/, data: /\b(?:data|numbers|analy\w+|statistics)\b/,
    hands: /\b(?:hands[- ]on|practical|build things|make things)\b/, creative: /\b(?:creative|creating|designing|drawing|art|artistic)\b/,
  },
  interests: {
    tech: /\b(?:tech|technology|software|apps?|ai|robots?)\b/, helping: /\b(?:help(?:ing)? people|helping|social service|serve people|patients?)\b/,
    business: /\b(?:business|finance|money|startups?|entrepreneur\w*|marketing)\b/, design: /\b(?:design|media|film|fashion|graphics?)\b/,
    puzzles: /\b(?:puzzles?|problem[- ]solving|logic|riddles?)\b/, health: /\b(?:health|medicine|medical|doctor|body|fitness)\b/,
  },
  field: { tech: /\b(?:in tech|it field|it sector|software field)\b/, health: /\b(?:healthcare|health care|medical field)\b/, business: /\b(?:business field|finance field|commerce field)\b/ },
};

export function ruleExtract(input) {
  // "dont", "cant", "wont" without the apostrophe are how people actually type.
  const text = ` ${String(input || '').toLowerCase().replace(/[’']/g, "'").replace(/\b(do|does|did|ca|wo|is|are|would|could|should|have|has|was|were)n?t\b/g, (w) => ({ dont: "don't", doesnt: "doesn't", didnt: "didn't", cant: "can't", wont: "won't", isnt: "isn't", arent: "aren't", wouldnt: "wouldn't", couldnt: "couldn't", shouldnt: "shouldn't", havent: "haven't", hasnt: "hasn't", wasnt: "wasn't", werent: "weren't" }[w] || w))} `;
  const f = emptyFilters();

  // Pay: "20 lakh", "1 crore", "30 LPA". In a careers chat money is pay unless it sits next to study-cost
  // words ("budget of 2 lakh for fees"). An earning word right beside the number always wins, so
  // "I can afford 2 lakh fees and want to earn 20 lakh" reads 20, not 2.
  const pay = /(\d+(?:\.\d+)?)\s*(lakhs?|lacs?|lpa|l\.?p\.?a|crores?|cr)\b/g;
  let m;
  while ((m = pay.exec(text))) {
    const end = m.index + m[0].length;
    const near = text.slice(Math.max(0, m.index - 25), m.index) + ' ' + text.slice(end, end + 18);
    const unit = m[2];
    const explicit = /lpa|l\.?p\.?a/.test(unit);
    const earns = /\b(?:earn|earning|salary|package|ctc|income|pay|paid|make|per annum|p\.a|a year|per year|annual)\b/.test(near);
    const cost = /\b(?:fees?|budget|afford|tuition|loan|cost|spend|study)\b/.test(near);
    const upTo = /\b(?:under|below|less than|upto|up to|maximum|max)\b/.test(text.slice(Math.max(0, m.index - 15), m.index));
    if ((explicit || earns || !cost) && !upTo) {
      f.min_salary_lpa = Math.round(+m[1] * (/cr/.test(unit) ? 100 : 1) * 10) / 10;
      break;
    }
  }

  const negated = new Set();
  for (const [group, table] of Object.entries(KEYWORDS)) {
    if (group === 'field') continue;
    for (const [key, re] of Object.entries(table)) {
      if (!re.test(text)) continue;
      const neg = new RegExp(`${NEG}\\s+(?:\\w+\\s+){0,2}${re.source}`).test(text);
      if (neg) negated.add(key);
      else if (!negated.has(key)) f[group].push(key);
    }
  }
  // "hate maths" means avoid maths, not "likes maths"
  f.subjects = f.subjects.filter((s) => !negated.has(s));
  if (negated.has('maths')) f.avoid.push('maths');
  if (negated.has('health') || /\b(?:blood|patients? care|hospitals?)\b/.test(text) && new RegExp(`${NEG}\\s+(?:\\w+\\s+){0,3}(?:blood|patients?|hospitals?)`).test(text)) {
    // Keep what they DO like ("helping people"); the avoid filter is what removes the blood-and-hospital roles.
    f.avoid.push('clinical');
  }
  if (new RegExp(`${NEG}\\s+(?:\\w+\\s+){0,2}(?:desk|office|sitting)`).test(text)) f.avoid.push('desk');
  if (/\b(?:no|without|avoid|hate)\s+(?:\w+\s+)?(?:entrance )?exams?\b/.test(text)) f.exams = 0;
  else if (/\b(?:ready|happy|fine|don't mind)\b.*\bexams?\b/.test(text)) f.exams = 2;
  if (/\b(?:start earning (?:early|soon|quickly|fast)|earn (?:early|soon)|quickly|short course|short path|shorter)\b/.test(text)) f.years = 0;
  else if (/\b(?:long study|study for many years|don't mind studying|happy to study)\b/.test(text)) f.years = 2;
  if (/\b(?:low budget|cheap|affordable|low cost|lower cost)\b/.test(text)) f.budget = 0;
  if (/\b(?:stay (?:near|at|in)|near home|(?:don't|do not|won't|will not|can't|cannot) (?:want to |be able to )?(?:move|relocate)|not (?:move|relocate)|my city)\b/.test(text)) f.reloc = 0;
  else if (/\b(?:happy to (?:move|relocate)|relocate|abroad|any city)\b/.test(text)) f.reloc = 2;
  for (const [field, re] of Object.entries(KEYWORDS.field)) if (re.test(text)) f.field = field;

  for (const k of ['subjects', 'style', 'interests', 'avoid']) f[k] = [...new Set(f[k])];
  return f;
}

// ---------------------------------------------------------------------------
// Content helpers (content = { careers, ladders } in the app's shapes)
// ---------------------------------------------------------------------------
const byId = (content) => (content._byId ||= Object.fromEntries(content.careers.map((c) => [c.id, c])));

export function ladderOf(content, roleId) {
  const role = byId(content)[roleId];
  return content.ladders[roleId] || (role?.parent ? content.ladders[role.parent] : null) || null;
}

// Where pay reaches the target. Prefers the earliest level, on any track, whose whole range is at or
// above it ("typical"). Only when no level does is the earliest level whose top of range gets there
// reported, as "possible". Roles that never reach it return null.
export function salaryReach(content, role, target) {
  const ladder = ladderOf(content, role.id);
  const best = { typical: null, possible: null };
  if (ladder) {
    for (const track of ladder.tracks) {
      track.levels.forEach((level, i) => {
        const r = parsePayLpa(level.pay.value);
        if (!r || r.max < target) return;
        const kind = r.min >= target ? 'typical' : 'possible';
        if (!best[kind] || i < best[kind].i) best[kind] = { i, level, trackName: ladder.tracks.length > 1 ? track.name : null };
      });
    }
  }
  const pick = best.typical ? ['typical', best.typical] : best.possible ? ['possible', best.possible] : null;
  if (pick) {
    const [kind, b] = pick;
    return { kind, title: b.level.title, pay: b.level.pay.value, when: b.level.when, track: b.trackName, atStart: false, index: b.i };
  }
  const entry = parsePayLpa(role.fields.salary.value);
  if (entry && entry.max >= target) {
    return { kind: entry.min >= target ? 'typical' : 'possible', title: 'Entry level', pay: role.fields.salary.value, when: 'from the start', track: null, atStart: true, index: -1 };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Retrieval. Filter on hard constraints, rank by fit (never by pay), at most two per family.
//
// Order: fit score; then, when a pay target is set, roles whose pay TYPICALLY reaches it before roles
// where only the top of the range does, and sooner before later (time to goal, not size of pay);
// then parent before specialisation, then a stable pseudo-random order for exact ties, so no role is
// favoured for its name. One role per family unless asked for more.
// ---------------------------------------------------------------------------
export function tieBreak(roleId, f) {
  const s = `${roleId}|${JSON.stringify([f.subjects, f.style, f.interests, f.field, f.min_salary_lpa])}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const reachOrder = (r) => (r ? [r.kind === 'typical' ? 0 : 1, r.index] : [0, 0]);
export const compareHits = (f) => (a, b) => {
  const [ak, ai] = reachOrder(a.reach), [bk, bi] = reachOrder(b.reach);
  // On a tie the parent role beats its specialisations ("Software Developer", not "Game Developer"), unless the specialisation fits better.
  return b.m.s - a.m.s || ak - bk || ai - bi || (a.role.parent ? 1 : 0) - (b.role.parent ? 1 : 0) || tieBreak(a.role.id, f) - tieBreak(b.role.id, f) || a.role.id.localeCompare(b.role.id);
};

export function retrieve(f, content, { limit = 5, perFamily = 1 } = {}) {
  const roles = byId(content);
  const careers = content.careers;

  // "Tell me about the Data Analyst": answer with that role, no ranking needed.
  if (f.named_roles.length) {
    const hits = f.named_roles.map((id) => roles[id]).filter(Boolean).map((role) => makeHit(role, f, content, scoreRole(role, f)));
    return { hits, total: hits.length, empty: null, relaxed: false };
  }

  const stated = f.subjects.length + f.style.length + f.interests.length;
  const run = (requireOverlap) => {
    const rows = [];
    for (const role of careers) {
      if (f.field && role.field !== f.field) continue;
      if (f.avoid.some((flag) => role.tags.flags.includes(flag))) continue; // "no" means no, not a penalty
      const reach = f.min_salary_lpa != null ? salaryReach(content, role, f.min_salary_lpa) : null;
      if (f.min_salary_lpa != null && !reach) continue;
      const m = scoreRole(role, f);
      if (requireOverlap && stated && m.subjects.length + m.style.length + m.interests.length === 0) continue;
      rows.push({ role, m, reach });
    }
    // Pay only appears in the order as "does the range typically reach it, and how soon", never as "how much".
    rows.sort(compareHits(f));
    return rows;
  };

  let rows = run(true);
  let relaxed = false;
  if (!rows.length && stated) { rows = run(false); relaxed = rows.length > 0; }

  const familyCount = {};
  const picked = [];
  for (const r of rows) {
    const fam = r.role.parent || r.role.id;
    if ((familyCount[fam] || 0) >= perFamily) continue;
    familyCount[fam] = (familyCount[fam] || 0) + 1;
    picked.push(r);
    if (picked.length >= limit) break;
  }
  const hits = picked.map((r) => makeHit(r.role, f, content, r.m, r.reach));

  let empty = null;
  if (!hits.length) {
    if (f.min_salary_lpa != null) {
      let top = 0;
      for (const role of careers) for (const l of ladderOf(content, role.id)?.tracks.flatMap((t) => t.levels) || []) top = Math.max(top, parsePayLpa(l.pay.value)?.max || 0);
      empty = { reason: 'salary', max_lpa: top };
    } else empty = { reason: 'constraints' };
  }
  return { hits, total: rows.length, empty, relaxed };
}

function makeHit(role, f, content, m, reach = null) {
  return {
    id: role.id,
    matched: [...m.subjects, ...m.style, ...m.interests],
    gaps: m.gaps,
    reach: reach || (f.min_salary_lpa != null ? salaryReach(content, role, f.min_salary_lpa) : null),
    entry_pay: role.fields.salary.value,
    study: role.fields.study.value,
    exam: role.fields.exam.value,
    check: role.check,
  };
}

// ---------------------------------------------------------------------------
// Deterministic wording. Used when no model is available, and to replace any model sentence that
// fails validation. Everything quoted here is copied from the cards.
// ---------------------------------------------------------------------------
export function reachSentence(hit) {
  if (!hit.reach) return '';
  const r = hit.reach;
  if (r.atStart) return `Pay is ${r.pay} from the start.`;
  const verb = r.kind === 'typical' ? 'reaches' : 'can reach';
  return `Pay starts at ${hit.entry_pay} and ${verb} ${r.pay} as ${r.title} (${r.when}${r.track ? `, ${r.track.toLowerCase()}` : ''}).`;
}

export function templateWhy(hit, f) {
  const parts = [];
  if (hit.matched.length) parts.push(`You mentioned ${joinList(hit.matched.slice(0, 3))}, which this role uses.`);
  else if (f.field) parts.push(`It is in ${FIELD_LABELS[f.field]}, as you asked.`);
  else parts.push('It fits the limits you gave.');
  // Pay is shown as "Starts at / Reaches" lines on the card, so it is not repeated in the sentence.
  return parts.join(' ');
}

export function templateIntro(f, result) {
  if (result.empty?.reason === 'salary') {
    return `No role in our data reaches ₹${f.min_salary_lpa} LPA with those preferences. The highest typical range we have tops out around ₹${result.empty.max_lpa} LPA, so try a lower number or widen your interests.`;
  }
  if (result.empty) return 'Nothing matched all of that. Try removing one of the filters below.';
  if (f.named_roles.length) return 'Here is what we have on that role.';
  if (f.min_salary_lpa != null) {
    return `Here are roles worth exploring where pay reaches about ₹${f.min_salary_lpa} LPA or more. Starting pay is lower, so each one shows where it gets there and how long that usually takes.`;
  }
  return 'Here are roles worth exploring based on what you told me.';
}

export const DEFAULT_FOLLOW_UP = 'What are you good at, and roughly what pay or study time are you aiming for?';

// ---------------------------------------------------------------------------
// One turn of conversation, end to end, with template wording. The device uses this as is (quick
// matches); the Edge Function uses it as the base and only lays validated model sentences on top.
// ---------------------------------------------------------------------------

// "tell me about the Surgeon": role names mentioned in the text (parenthetical suffixes ignored).
export function namedRolesIn(text, careers) {
  const lower = String(text || '').toLowerCase();
  return careers.filter((c) => lower.includes(c.name.toLowerCase().replace(/\s*\(.*\)/, ''))).map((c) => c.id).slice(0, 3);
}

// Keyword understanding: { filters, intent }.
export function rulesUnderstand(text, content) {
  const filters = ruleExtract(text);
  const named = namedRolesIn(text, content.careers);
  if (named.length && !hasSignal(filters)) filters.named_roles = named;
  const intent = filters.named_roles.length ? 'info' : hasSignal(filters) ? 'recommend' : 'need_more';
  return { filters, intent };
}

export function buildAnswer({ intent, prior, fresh, content, clarifying = null, limit = 5 }) {
  const base = prior || emptyFilters();
  const merged = intent === 'info' ? { ...base, named_roles: fresh.named_roles } : mergeFilters(base, fresh);
  const chips = describeFilters(merged);
  if (intent === 'need_more' || !hasSignal(merged)) {
    return { intent: 'need_more', filters: merged, chips, hits: [], total: 0, empty: null, relaxed: false, reply: { intro: 'I need a little more to go on.', follow_up: clarifying || DEFAULT_FOLLOW_UP } };
  }
  const result = retrieve(merged, content, { limit });
  return {
    intent, filters: merged, chips,
    reply: { intro: templateIntro(merged, result), follow_up: null },
    hits: result.hits.map((h) => ({ id: h.id, why: templateWhy(h, merged), matched: h.matched, reach: h.reach, entry_pay: h.entry_pay, study: h.study, exam: h.exam, check: h.check })),
    total: result.total, empty: result.empty, relaxed: result.relaxed,
  };
}

// ---------------------------------------------------------------------------
// Privacy: strip anything that identifies a person before text goes to a model or a log.
// ---------------------------------------------------------------------------
export function redact(text) {
  return String(text || '')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[link removed]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email removed]')
    .replace(/\+?\d(?:[\s-]?\d){9,}/g, '[number removed]')
    .trim();
}
