import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, SEEDED_QUEUE } from '../store';
import { CAREER_MAP } from '../data/careers';
import { fmtDate } from '../lib/freshness';
import { isConfigured } from '../lib/supabase';
import AdminDb from './AdminDb';

const FILTERS = [['all', 'All'], ['salary', 'Salary'], ['exam', 'Exam'], ['reports', 'Reports']];

// S24: internal review queue (web only). Changes past the threshold and user reports wait here;
// nothing in this queue is published until a reviewer approves it.
function AdminLocal() {
  const reports = useStore((s) => s.reports);
  const decisions = useStore((s) => s.adminDecisions);
  const decide = useStore((s) => s.adminDecide);
  const [filter, setFilter] = useState('all');

  const rows = [
    ...SEEDED_QUEUE.map((q) => ({ ...q, kind: 'change' })),
    ...reports.map((r) => ({ id: r.id, kind: 'report', roleId: r.roleId, field: r.field, old: '', next: r.text, source: 'Student report', note: `Reported ${fmtDate(new Date(r.date).toISOString())}` })),
  ].filter((r) => filter === 'all' || (filter === 'reports' ? r.kind === 'report' : r.field === filter));
  const pending = rows.filter((r) => !decisions[r.id]).length;

  return (
    <div className="admin stack-lg">
      <div className="row spread wrap">
        <div>
          <h1>Review queue ({pending} pending)</h1>
          <p className="small muted">Internal. In production this sits behind staff login. Approving a change publishes it with today’s date; approving a student report awards the Fact Checker badge.</p>
        </div>
        <Link className="btn sm" to="/">Back to app</Link>
      </div>

      <div className="chips" role="group" aria-label="Filter">
        {FILTERS.map(([k, label]) => <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>)}
      </div>

      <div className="card tablewrap">
        <table>
          <thead>
            <tr><th>Role</th><th>Field</th><th>Old → New</th><th>Source</th><th>Note</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="muted">Nothing in this view.</td></tr>}
            {rows.map((r) => {
              const d = decisions[r.id];
              return (
                <tr key={r.id}>
                  <td>{CAREER_MAP[r.roleId]?.name}</td>
                  <td>{r.kind === 'report' ? `Report: ${r.field}` : r.field}</td>
                  <td>{r.kind === 'report' ? <em>“{r.next}”</em> : `${r.old} → ${r.next}`}</td>
                  <td>{r.source}</td>
                  <td className="small muted">{r.note}</td>
                  <td>
                    {d ? (
                      <span className={`tag ${d === 'approved' ? 'good' : ''}`}>{d === 'approved' ? '✓ Approved' : '✗ Rejected'}</span>
                    ) : (
                      <span className="row" style={{ gap: 6 }}>
                        <button className="btn sm" aria-label={`Approve change for ${CAREER_MAP[r.roleId]?.name}`} onClick={() => decide(r.id, 'approved')}>✓</button>
                        <button className="btn sm" aria-label={`Reject change for ${CAREER_MAP[r.roleId]?.name}`} onClick={() => decide(r.id, 'rejected')}>✗</button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">Small changes (under 10% and not exam or eligibility) auto-publish with a log entry and never reach this queue.</p>
    </div>
  );
}

// With Supabase configured the queue lives in the database behind a reviewer sign-in; without it,
// this on-device version keeps the prototype working.
export default function Admin() {
  return isConfigured ? <AdminDb /> : <AdminLocal />;
}
