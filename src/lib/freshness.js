// Field freshness helpers (US17). A field older than STALE_DAYS gets a "May be outdated" tag.

export const STALE_DAYS = 90;
const DAY = 864e5;

export const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();
export const ageDays = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));
export const isStale = (iso) => ageDays(iso) > STALE_DAYS;

export function ageLabel(iso) {
  const d = ageDays(iso);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 60) return `${d} days ago`;
  return `${Math.round(d / 30)} months ago`;
}

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Local calendar day, used for the daily XP cap.
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function agoShort(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  return `${Math.floor(h / 24)} days ago`;
}

export function fmtMoney(min, max) {
  const one = (k) => (k >= 100 ? `${+(k / 100).toFixed(1)} L` : `${k}k`);
  if (max == null || min === max) return `₹${one(min)}`;
  if (min === 0) return `Up to ₹${one(max)}`;
  return `₹${one(min)}–${one(max)}`;
}

export function fmtDuration(minM, maxM) {
  const one = (m) => (m >= 12 ? `${+(m / 12).toFixed(1)} yr${m / 12 > 1 ? 's' : ''}` : `${m} month${m > 1 ? 's' : ''}`);
  return minM === maxM ? one(minM) : `${one(minM)} – ${one(maxM)}`;
}
