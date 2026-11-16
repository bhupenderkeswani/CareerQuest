// Single source of truth for XP rules, the daily cap and level thresholds (spec 5.2).
// Rebalance here only; nothing else hardcodes these numbers.

import { REVIEWED_ON, REVIEWED_THROUGH } from '../data/verified';

// What is switched on. The product is cut to quiz, compare and Side Quests (mentor feedback, Nov 2026); everything
// else is built but off. Turn pieces back on at build time with VITE_FEATURES, for example
//   VITE_FEATURES=rewards,chat      or      VITE_FEATURES=all
// Reasons for each cut are in specs/feedback.md.
const FEATURE_NAMES = ['rewards', 'roadmaps', 'ladders', 'chat', 'accounts'];
const wanted = new Set(String(import.meta.env?.VITE_FEATURES || '').split(',').map((x) => x.trim()).filter(Boolean));
export const FEATURES = Object.fromEntries(FEATURE_NAMES.map((n) => [n, wanted.has('all') || wanted.has(n)]));

export const DAILY_CAP = 150;

// lifetime: each key earns XP once, ever.   dailyLimit: max awards per day.
// uniquePerDay: each key earns XP once per day.
export const XP_RULES = {
  open_card: { xp: 5, label: 'Opened a card', dailyLimit: 10, uniquePerDay: true },
  dailyquest: { xp: 10, label: 'Read the Daily Quest', lifetime: true },
  compare: { xp: 15, label: 'Compared careers', dailyLimit: 1 },
  sidequest: { xp: 10, label: 'Viewed a Side Quest', lifetime: true },
  roadmap_step: { xp: 20, label: 'Finished a roadmap step', lifetime: true },
  share: { xp: 10, label: 'Shared a card', dailyLimit: 3 },
  quiz: { xp: 50, label: 'Finished the quiz', lifetime: true },
  learned: { xp: 10, label: 'Shared what you learned', dailyLimit: 5, uniquePerDay: true },
};

export const LEVELS = [
  { n: 1, name: 'Rookie', at: 0 },
  { n: 2, name: 'Scout', at: 100 },
  { n: 3, name: 'Explorer', at: 250 },
  { n: 4, name: 'Navigator', at: 450 },
  { n: 5, name: 'Trailblazer', at: 700 },
  { n: 6, name: 'Cartographer', at: 1000 },
  { n: 7, name: 'Pioneer', at: 1400 },
  { n: 8, name: 'Strategist', at: 1900 },
  { n: 9, name: 'Sage', at: 2500 },
  { n: 10, name: 'Trailmaster', at: 3200 },
];

export function levelInfo(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.at) cur = l;
  const next = LEVELS.find((l) => l.n === cur.n + 1) || null;
  const pct = next ? Math.round(((xp - cur.at) / (next.at - cur.at)) * 100) : 100;
  return { ...cur, next, pct, toNext: next ? next.at - xp : 0 };
}

// The one date shown in Me ("About the data"). Bump it only after the figures have actually been re-checked
// against their sources; the per-field dates in the content tables are for reviewers, not shown to students.
export const DATA_REVIEWED = REVIEWED_ON;
export const DATA_REVIEWED_THROUGH = REVIEWED_THROUGH;
export const DATA_REVIEW_STALE_DAYS = 180; // past this, Me says the figures are due a re-check

export const FIELDS = {
  tech: { id: 'tech', label: 'Tech', emoji: '💻' },
  health: { id: 'health', label: 'Health & Fitness', emoji: '🩺' },
  business: { id: 'business', label: 'Business & Law', emoji: '📈' },
};

export const CLASS_STAGES = [
  { id: 'c11', label: 'Class 11', minor: true },
  { id: 'c12', label: 'Class 12', minor: true },
  { id: 'college', label: 'College', minor: false },
  { id: 'other', label: 'Other', minor: null },
];
