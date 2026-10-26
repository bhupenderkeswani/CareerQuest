// Client side of the role-finder chat.
//
//   consent 'ai'    -> ask the Edge Function (a model understands the message)
//   consent 'local' -> never leaves the device: keyword matching only
//   function down, quota spent, offline, or no Supabase -> the same keyword matching, quietly
//
// All three return the same shape, so the screen does not care which one answered.
import { create } from 'zustand';
import { supabase } from './supabase';
import { useStore } from '../store';
import { CAREERS } from '../data/careers';
import { LADDERS } from '../data/ladders';
import { buildAnswer, redact, removeChip, rulesUnderstand } from './match';

const CONSENT_KEY = 'cq_chat_consent';
const DEVICE_KEY = 'cq_device';

export const getConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
export const setConsent = (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ignore */ } };

// A random id for quotas and abuse checks. It is not tied to a name, phone or account.
let memoryDevice = null;
export function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
    return id;
  } catch {
    return (memoryDevice ||= crypto.randomUUID());
  }
}

// The content the whole app is using right now (Supabase, cached copy, or bundled sample).
const liveContent = () => ({ careers: CAREERS, ladders: LADDERS });

export function localTurn(message, prior, limit) {
  const content = liveContent();
  const { filters, intent } = rulesUnderstand(message, content);
  return { ...buildAnswer({ intent, prior, fresh: filters, content, limit }), meta: { source: 'device', provider: null, degraded: null } };
}

// Re-run retrieval for edited filters (a chip removed, or "show more"). Instant, free, offline-safe.
export function rerun(filters, limit = 5) {
  const empty = { subjects: [], style: [], interests: [], avoid: [], named_roles: [] };
  const answer = buildAnswer({ intent: 'recommend', prior: filters, fresh: { ...empty, min_salary_lpa: null, field: null, exams: null, years: null, budget: null, reloc: null }, content: liveContent(), limit });
  return { ...answer, meta: { source: 'device', provider: null, degraded: null } };
}
export { removeChip };

const serverUsable = (consent) => {
  const s = useStore.getState();
  return consent === 'ai' && Boolean(supabase) && navigator.onLine && !s.ui.simOffline;
};

export async function ask({ message, prior, lastQuestion, consent }) {
  if (serverUsable(consent)) {
    try {
      const { data, error } = await supabase.functions.invoke('role-chat', {
        // Personal details are stripped here too, so privacy does not depend on the server alone.
        body: { message: redact(message), filters: prior, last_question: lastQuestion || undefined, device: deviceId() },
      });
      if (!error && data && Array.isArray(data.hits) && data.filters) return { ...data, fallback: data.meta?.source === 'rules' ? data.meta.degraded || 'rules' : null };
    } catch { /* fall through to the device */ }
    return { ...localTurn(message, prior), fallback: 'unavailable' };
  }
  return { ...localTurn(message, prior), fallback: consent === 'ai' ? 'offline' : null };
}

// The conversation lives in memory only: it survives opening a role and coming back, but never
// touches the disk, so a shared phone does not keep a student's messages.
export const useChat = create((set) => ({
  messages: [],
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clear: () => set({ messages: [] }),
}));
