// Badge rules (US13). Each badge has a visible rule and a hint while locked.
// Badges reward breadth and learning. There is deliberately none for "highest salary viewed".
import { CAREER_MAP } from '../data/careers';
import { FIELDS } from './config';

const stepsDone = (s) => Math.max(0, ...Object.values(s.progress).map((p) => Object.keys(p).length));

export const BADGES = [
  { id: 'explorer', name: 'Explorer', icon: '🧭', rule: 'Open 3 careers', target: 3, progress: (s) => s.stats.opened.length, hint: () => 'Open any 3 career cards.' },
  { id: 'wide-angle', name: 'Wide Angle', icon: '🔭', rule: 'View careers in all 3 fields', target: 3, progress: (s) => s.stats.fields.length,
    hint: (s) => {
      const missing = Object.values(FIELDS).filter((f) => !s.stats.fields.includes(f.id));
      return missing.length ? `Try a ${missing[0].label} role.` : 'Done!';
    } },
  { id: 'daily-reader', name: 'Day in the Life', icon: '☀️', rule: 'Read the Daily Quest on 3 careers', target: 3, progress: (s) => s.stats.dailyQuests.length, hint: () => 'Expand the Daily Quest on a career card.' },
  { id: 'comparer', name: 'Comparer', icon: '⚖️', rule: 'Complete a 3-way compare', target: 1, progress: (s) => (s.stats.compare3 ? 1 : 0), hint: () => 'Add three careers to Compare, then open the compare screen.' },
  { id: 'switcher', name: 'Switcher', icon: '🔀', rule: 'Open 3 Side Quests', target: 3, progress: (s) => s.stats.sideQuests.length, hint: () => 'Open the Side Quests on a card and view three.' },
  { id: 'messenger', name: 'Messenger', icon: '💬', rule: 'Share a card', target: 1, progress: (s) => Math.min(1, s.stats.shares), hint: () => 'Use the share button on a career card.' },
  { id: 'pathfinder', name: 'Pathfinder', icon: '🗺️', rule: 'Complete the first 3 roadmap steps for a role', target: 3, progress: stepsDone, hint: () => 'Open a roadmap and mark three steps done.' },
  { id: 'compass', name: 'Compass Set', icon: '🎯', rule: 'Finish the interest quiz', target: 1, progress: (s) => (s.stats.quizDone ? 1 : 0), hint: () => 'Take the quiz on the For You tab.' },
  { id: 'reflector', name: 'Reflector', icon: '💡', rule: 'Tell us what you learned on 3 cards', target: 3, progress: (s) => s.stats.learned, hint: () => 'Answer “Did you learn something new?” on a card.' },
  { id: 'curator', name: 'Curator', icon: '⭐', rule: 'Save 3 careers to your shortlist', target: 3, progress: (s) => s.stats.saved, hint: () => 'Tap the heart on three career cards.' },
  { id: 'source-seeker', name: 'Source Seeker', icon: '🔎', rule: 'Check where 3 numbers come from', target: 3, progress: (s) => s.stats.fieldInfo.length, hint: () => 'Tap the ⓘ next to a number to see its source.' },
  { id: 'curious', name: 'Curious Mind', icon: '🔍', rule: 'Open 10 careers', target: 10, progress: (s) => s.stats.opened.length, hint: () => 'Keep exploring. There are plenty more.' },
  { id: 'deep-diver', name: 'Deep Diver', icon: '🤿', rule: 'Open 3 specialisations inside a career', target: 3,
    progress: (s) => s.stats.opened.filter((id) => CAREER_MAP[id]?.parent).length, hint: () => 'Open a career with specialisations, like Doctor, and look inside.' },
  { id: 'off-path', name: 'Off the Beaten Path', icon: '🌱', rule: 'Open a recommended role outside your usual stream', target: 1, progress: (s) => (s.stats.outsideOpened ? 1 : 0), hint: () => 'Look for the 🔀 tag in your quiz results.' },
  { id: 'fact-checker', name: 'Fact Checker', icon: '✅', rule: 'Report a data error that gets accepted', target: 1, progress: (s) => (s.stats.reportAccepted ? 1 : 0), hint: () => 'Use “Report an error” if a number looks wrong.' },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function badgeProgress(badge, state) {
  const cur = Math.min(badge.target, badge.progress(state));
  return { cur, target: badge.target, pct: Math.round((cur / badge.target) * 100) };
}

// For the level-up modal copy.
export const roleName = (id) => CAREER_MAP[id]?.name || id;
