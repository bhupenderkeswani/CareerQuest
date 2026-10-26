import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CAREER_MAP } from '../data/careers';
import { fmtDate } from '../lib/freshness';
import { refreshContent } from '../content/content';

const FILTERS = [['pending', 'Pending'], ['all', 'All'], ['salary', 'Salary'], ['exam', 'Exam'], ['reports', 'Reports']];

function SignIn({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message); else onDone();
  };
  return (
    <form className="stack" onSubmit={submit} style={{ maxWidth: 380 }}>
      <h2>Reviewer sign-in</h2>
      <p className="small muted">Staff only. Students never need to sign in to use CareerQuest.</p>
      <div><label className="lbl" htmlFor="adm-email">Email</label><input id="adm-email" className="field-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div><label className="lbl" htmlFor="adm-pass">Password</label><input id="adm-pass" className="field-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
      {error && <div className="err" role="alert">{error}</div>}
      <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

function Queue({ user, onSignOut }) {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('field_update_log')
      .select('id, kind, career_id, field, old_value, new_value, source, note, status, created_at, reviewed_at')
      .order('created_at', { ascending: false }).limit(200);
    if (err) setError(err.message); else { setRows(data); setError(''); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const decide = async (id, decision) => {
    setBusyId(id); setError('');
    const { error: err } = await supabase.rpc('review_update', { p_id: id, p_decision: decision });
    setBusyId(null);
    if (err) setError(err.message);
    else { await load(); refreshContent(); } // an approved change is live for students on their next load
  };

  const shown = (rows || []).filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'all') return true;
    if (filter === 'reports') return r.kind === 'report';
    return r.field === filter;
  });
  const pending = (rows || []).filter((r) => r.status === 'pending').length;

  return (
    <>
      <div className="row spread wrap">
        <div>
          <h1>Review queue ({pending} pending)</h1>
          <p className="small muted">Signed in as {user.email}. Approving a change publishes it with today’s date. Approving a student report only records that it was right: edit the value yourself if it needs fixing.</p>
        </div>
        <div className="row"><Link className="btn sm" to="/">Back to app</Link><button className="btn sm" onClick={onSignOut}>Sign out</button></div>
      </div>

      <div className="chips" role="group" aria-label="Filter">
        {FILTERS.map(([k, label]) => <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>)}
      </div>
      {error && <div className="err" role="alert">{error}</div>}

      <div className="card tablewrap">
        <table>
          <thead><tr><th>Role</th><th>Field</th><th>Old → New</th><th>Source</th><th>Note</th><th>Action</th></tr></thead>
          <tbody>
            {rows === null && <tr><td colSpan={6} className="muted">Loading…</td></tr>}
            {rows && shown.length === 0 && <tr><td colSpan={6} className="muted">Nothing in this view.</td></tr>}
            {shown.map((r) => {
              const name = CAREER_MAP[r.career_id]?.name || r.career_id;
              return (
                <tr key={r.id}>
                  <td>{name}</td>
                  <td>{r.kind === 'report' ? `Report: ${r.field}` : r.field}</td>
                  <td>{r.kind === 'report' ? <em>“{r.new_value}”</em> : `${r.old_value ?? ''} → ${r.new_value}`}</td>
                  <td>{r.source}</td>
                  <td className="small muted">{r.note || (r.kind === 'report' ? `Reported ${fmtDate(r.created_at)}` : '')}</td>
                  <td>
                    {r.status === 'pending' ? (
                      <span className="row" style={{ gap: 6 }}>
                        <button className="btn sm" disabled={busyId === r.id} aria-label={`Approve change for ${name}`} onClick={() => decide(r.id, 'approved')}>✓</button>
                        <button className="btn sm" disabled={busyId === r.id} aria-label={`Reject change for ${name}`} onClick={() => decide(r.id, 'rejected')}>✗</button>
                      </span>
                    ) : (
                      <span className={`tag ${r.status === 'rejected' ? '' : 'good'}`}>{r.status === 'rejected' ? '✗ Rejected' : r.status === 'auto' ? 'Auto-published' : '✓ Approved'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">Small changes (under 10% and not exam or eligibility) auto-publish with a log entry and never reach this queue.</p>
    </>
  );
}

// S24 backed by Supabase. Only an account with app_metadata.role = 'admin' can see or decide anything:
// the database enforces that, this screen only reflects it.
export default function AdminDb() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user;
  const isAdmin = user?.app_metadata?.role === 'admin';
  const signOut = () => supabase.auth.signOut();

  return (
    <div className="admin stack-lg">
      {session === undefined && <p className="muted">Loading…</p>}
      {session === null && <SignIn onDone={() => {}} />}
      {session && !isAdmin && (
        <div className="stack" style={{ maxWidth: 480 }}>
          <h2>Not a reviewer account</h2>
          <p>You are signed in as {user.email}, but this account does not have the reviewer role. Ask a project owner to grant it (see the README), then sign in again.</p>
          <div className="row"><button className="btn" onClick={signOut}>Sign out</button><Link className="btn" to="/">Back to app</Link></div>
        </div>
      )}
      {session && isAdmin && <Queue user={user} onSignOut={signOut} />}
    </div>
  );
}
