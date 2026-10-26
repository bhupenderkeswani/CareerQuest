// Tiny analytics shim (spec section 9). Events are logged to the console and kept in a
// local ring buffer; a real build would forward them to the analytics backend.
// Only the event name and non-personal props are recorded.

const KEY = 'cq_events_v1';
const MAX = 300;

export function track(name, props = {}) {
  const evt = { name, props, t: Date.now() };
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    list.push(evt);
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {
    /* storage blocked: analytics must never break the app */
  }
  if (import.meta.env.DEV) console.debug('[track]', name, props);
}

export function readEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearEvents() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
