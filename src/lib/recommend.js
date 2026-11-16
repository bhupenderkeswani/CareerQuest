// Rule-based matcher for the quiz (US14, US15).
//
// This is the same code path the AI step would sit behind: a hosted model may only RANK and
// PHRASE top-level roles that exist in the curated data (specialisations are reached via their parent card), and may only quote values from the role's own card.
// If the model call fails, this function's output is used with the identical UI.
// Inputs never include caste, religion, gender or family income.
import { TOP_LEVEL } from '../data/careers';
import { TRIED, joinList as list, scoreRole as score } from './match';

const STREAM_WEIGHTS = {
  maths: { tech: 0.6, business: 0.3 }, computers: { tech: 1 }, science: { health: 1, tech: 0.4 },
  commerce: { business: 1 }, languages: { business: 0.3 }, social: { business: 0.3 },
};

// The student's "current stream", read from the subjects they like.
export function streamOf(answers) {
  const score = { tech: 0, health: 0, business: 0 };
  for (const s of answers.subjects || []) {
    for (const [field, w] of Object.entries(STREAM_WEIGHTS[s] || {})) score[field] += w;
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : null;
}

// Lower-cases only an ordinary first word, so abbreviations like B.Com, MBBS or BCA keep their capitals.
const inSentence = (t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

function why(role, m, a, mentioned = false) {
  const likes = [...m.subjects, ...m.style, ...m.interests];
  const parts = [];
  if (mentioned) parts.push('You said you are thinking about this role.');
  if (likes.length) parts.push(`You like ${list(likes.slice(0, 3))}, which this role uses.`);
  else if (mentioned) parts.push('None of your other answers point to it directly, so read the card before deciding.');
  else parts.push('It lines up with the practical limits you chose.');
  if (m.tried?.length) parts.push(`You have already tried ${list(m.tried.slice(0, 2).map((k) => TRIED[k].label))}.`);
  if (!m.gaps.includes('years') && a.years != null) parts.push(`The study path (${inSentence(role.fields.study.value)}) fits what you said about study time.`);
  else if (!m.gaps.includes('cost') && a.budget != null && parts.length < 2) parts.push('Its study costs sit within what you said was comfortable.');
  return parts.join(' ');
}

function checkLine(role, m) {
  if (m.gaps.includes('exam')) return `Needs entrance-exam preparation. Entry exam: ${role.fields.exam.value}.`;
  if (m.gaps.includes('years')) return `The path is longer than you said you want: ${role.fields.study.value}.`;
  if (m.gaps.includes('cost')) return `Study cost may be above your comfort level: ${role.fields.cost.value}.`;
  if (m.gaps.includes('reloc')) return 'You may need to move for college or your first job.';
  return role.check;
}

export function recommend(answers) {
  const stream = streamOf(answers);
  const scored = TOP_LEVEL.map((role) => ({ role, ...score(role, answers) })).sort((a, b) => b.s - a.s || a.role.name.localeCompare(b.role.name));
  const mentioned = (answers.aspiration || []).filter((id) => scored.some((x) => x.role.id === id)).slice(0, 2);
  const isOutside = (x) => Boolean(stream) && x.role.field !== stream;
  // A student who is unsure of, or struggling in, their stream sees two roles from outside it instead of one.
  const needOutside = ['unsure', 'struggling'].includes(answers.stream_fit) ? 2 : 1;

  let top = scored.slice(0, 5);
  // Roles the student named always appear, in their honest place (their rank still follows the fit).
  for (const id of mentioned) {
    if (top.some((x) => x.role.id === id)) continue;
    const drop = [...top].reverse().find((x) => !mentioned.includes(x.role.id));
    top[top.indexOf(drop)] = scored.find((x) => x.role.id === id);
  }
  // Spec: at least one role must be outside the student's current stream.
  if (stream) {
    while (top.filter(isOutside).length < needOutside) {
      const candidate = scored.find((x) => isOutside(x) && !top.includes(x));
      const drop = [...top].reverse().find((x) => !isOutside(x) && !mentioned.includes(x.role.id));
      if (!candidate || !drop) break;
      top[top.indexOf(drop)] = candidate;
    }
  }
  top = top.sort((a, b) => b.s - a.s || a.role.name.localeCompare(b.role.name));

  return top.map((x, i) => ({
    roleId: x.role.id,
    rank: i + 1,
    why: why(x.role, x, answers, mentioned.includes(x.role.id)),
    check: checkLine(x.role, x),
    outside: isOutside(x),
    mentioned: mentioned.includes(x.role.id),
    feedback: null,
    source: 'rules-v2',
  }));
}
