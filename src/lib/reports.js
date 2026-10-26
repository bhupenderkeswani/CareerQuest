// Error reports (US17): filed locally first so they work offline, uploaded when a connection and
// Supabase are available, then checked back for the reviewer's decision.
import { supabase } from './supabase';
import { useStore } from '../store';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isOffline = () => !navigator.onLine || useStore.getState().ui.simOffline;
let running = null;

async function run() {
  const store = useStore.getState();

  // 1. Upload anything not yet sent. Reports from before the database existed (non-uuid ids) are skipped.
  const unsent = store.reports.filter((r) => !r.synced);
  for (const r of unsent) {
    if (!UUID.test(r.id)) { store.markReportsSynced([r.id]); continue; }
    const { error } = await supabase.from('field_update_log').insert({
      id: r.id, kind: 'report', career_id: r.roleId, field: r.field, new_value: r.text, source: 'Student report', status: 'pending',
    });
    // 23505: already uploaded on an earlier attempt. Anything else that is a rule violation will never
    // succeed, so stop retrying it; network errors are retried next time.
    if (!error || ['23505', '42501', '23514', '23503', '22001'].includes(error.code)) store.markReportsSynced([r.id]);
    else return;
  }

  // 2. Ask what happened to the ones still waiting.
  const waiting = useStore.getState().reports.filter((r) => r.synced && UUID.test(r.id) && (!r.status || r.status === 'pending'));
  if (!waiting.length) return;
  const { data, error } = await supabase.rpc('report_statuses', { p_ids: waiting.map((r) => r.id) });
  if (error || !Array.isArray(data)) return;
  for (const row of data) if (row.status === 'approved' || row.status === 'rejected') useStore.getState().setReportStatus(row.id, row.status);
}

export function syncReports() {
  if (!supabase || isOffline()) return Promise.resolve();
  if (!running) running = run().catch((e) => console.warn('[reports] sync failed:', e?.message)).finally(() => { running = null; });
  return running;
}
