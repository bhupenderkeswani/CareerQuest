import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { clearEvents, readEvents } from '../lib/analytics';
import { isConfigured, configProblem } from '../lib/supabase';
import { useContent, refreshContent } from '../content/content';
import { agoShort } from '../lib/freshness';
import { consentAllowsSync, hasUnsaved, signOutAccount } from '../lib/account';
import { TopBar } from '../components/TopBar';

export function downloadExport(data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'careerquest-my-data.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Switch({ checked, onChange, label }) {
  return <button className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

// S20: notifications (opt-in), data export and delete, quiz answers.
export default function Settings() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const notif = useStore((s) => s.notif);
  const setNotif = useStore((s) => s.setNotif);
  const exportData = useStore((s) => s.exportData);
  const [confirmOut, setConfirmOut] = useState(false);
  const simOffline = useStore((s) => s.ui.simOffline);
  const setSimOffline = useStore((s) => s.setSimOffline);
  const pushToast = useStore((s) => s.pushToast);
  const [events, setEvents] = useState(null);
  const content = useContent();
  const [refreshing, setRefreshing] = useState(false);
  const sourceLabel = !isConfigured ? 'Bundled sample data (Supabase not configured)'
    : content.source === 'network' ? 'Supabase (live)' : content.source === 'cache' ? 'Saved copy of Supabase content' : 'Bundled sample data (Supabase unreachable)';

  return (
    <div className="stack-lg">
      <TopBar title="Settings" backTo="/me" />

      <section>
        <div className="sectionhead"><h2>Notifications</h2></div>
        <div className="card">
          <div className="row spread">
            <div>
              <div>Role updates</div>
              <div className="small muted">Only when a role you saved changes. Max 2 a week. Off by default.</div>
            </div>
            <Switch checked={notif.roleUpdates} onChange={(v) => setNotif('roleUpdates', v)} label="Role updates" />
          </div>
        </div>
      </section>

      <section>
        <div className="sectionhead"><h2>My data</h2></div>
        <ul className="list card">
          <li><button className="listbtn" onClick={() => { downloadExport(exportData()); pushToast('Your data was downloaded.', 'info'); }}><span>Export my data</span><span aria-hidden="true">↓</span></button></li>
          <li><Link className="listbtn" to="/settings/delete"><span style={{ color: 'var(--bad)' }}>Delete {user ? 'my account' : 'my data'}</span><span aria-hidden="true">→</span></Link></li>
          <li><Link className="listbtn" to="/quiz"><span>Quiz answers</span><span className="linkbtn">Edit</span></Link></li>
        </ul>
      </section>

      <section>
        <div className="sectionhead"><h2>General</h2></div>
        <ul className="list card">
          <li className="listbtn" style={{ cursor: 'default' }}><span>Language</span><span className="muted">English (more coming)</span></li>
          <li>
            <details style={{ padding: '14px 0' }}>
              <summary style={{ cursor: 'pointer' }}>About this prototype</summary>
              <p className="small muted" style={{ marginTop: 8 }}>
                This is a working prototype of CareerQuest Phase 2. Guest mode keeps everything on this device; signing in with Google saves your progress to your account. See Me, “About the data”, for when the career figures were last checked.
              </p>
            </details>
          </li>
          <li>
            <details style={{ padding: '14px 0' }}>
              <summary style={{ cursor: 'pointer' }}>Help</summary>
              <p className="small muted" style={{ marginTop: 8 }}>
                Spot a wrong number? Tap ⓘ beside it, then “Report an error”. Rewards come from reading and finishing steps, not from clicking, and XP is capped each day.
              </p>
            </details>
          </li>
          {user && (
            <li>
              {!confirmOut ? (
                <button className="listbtn" onClick={async () => {
                  // Saved progress lives in the account, so signing out is safe. Unsaved progress would be lost: ask first.
                  if (!hasUnsaved()) { await signOutAccount(); nav('/welcome'); } else setConfirmOut(true);
                }}><span>Sign out</span></button>
              ) : (
                <div className="stack" style={{ padding: '12px 0' }}>
                  <p className="small">{consentAllowsSync(user)
                    ? 'Your latest progress has not finished saving to your account. Signing out now removes it from this device.'
                    : 'Your progress is not saved to your account yet (waiting for your guardian). Signing out removes it from this device.'}</p>
                  <div className="row wrap">
                    <button className="btn sm danger" onClick={async () => { await signOutAccount(); nav('/welcome'); }}>Sign out anyway</button>
                    <button className="btn sm" onClick={() => setConfirmOut(false)}>Stay signed in</button>
                  </div>
                </div>
              )}
            </li>
          )}
        </ul>
      </section>

      <section>
        <div className="sectionhead"><h2>Demo tools</h2></div>
        <div className="card stack">
          <div className="row spread">
            <div><div>Simulate offline</div><div className="small muted">See the offline banner and queued sync.</div></div>
            <Switch checked={simOffline} onChange={setSimOffline} label="Simulate offline" />
          </div>
          <div>
            <div>Content source</div>
            <div className="small muted">
              {sourceLabel}{content.fetchedAt ? ` · updated ${agoShort(content.fetchedAt)}` : ''}
            </div>
            {configProblem && <div className="err" role="alert">{configProblem}</div>}
            {isConfigured && content.error && <div className="small" style={{ color: 'var(--warn)' }}>Last refresh failed: {content.error}</div>}
            {content.dropped.length > 0 && <div className="small" style={{ color: 'var(--warn)' }}>{content.dropped.length} incomplete row(s) in the database were skipped.</div>}
            {isConfigured && (
              <button className="linkbtn" disabled={refreshing} onClick={async () => { setRefreshing(true); const r = await refreshContent(); setRefreshing(false); pushToast(r.ok ? 'Content refreshed.' : `Couldn’t refresh: ${r.reason}`, 'info'); }}>
                {refreshing ? 'Refreshing…' : 'Refresh content now'}
              </button>
            )}
          </div>
          <div>
            <button className="linkbtn" onClick={() => setEvents(events ? null : readEvents())}>{events ? 'Hide' : 'Show'} analytics events logged on this device</button>
            {events && (
              <div className="small" style={{ marginTop: 8 }}>
                <p className="muted">{events.length} events (latest 20 shown)</p>
                <pre style={{ overflow: 'auto', maxHeight: 220, background: 'var(--surface-2)', padding: 10, borderRadius: 10 }}>
                  {events.slice(-20).reverse().map((e) => `${new Date(e.t).toLocaleTimeString()}  ${e.name} ${Object.keys(e.props).length ? JSON.stringify(e.props) : ''}`).join('\n')}
                </pre>
                <button className="linkbtn" onClick={() => { clearEvents(); setEvents([]); }}>Clear events</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
