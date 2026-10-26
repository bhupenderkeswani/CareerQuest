import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore, useOnline } from '../store';
import { agoShort } from '../lib/freshness';

const TABS = [
  { to: '/', label: 'Explore', ico: '🧭', end: true },
  { to: '/foryou', label: 'For You', ico: '✨' },
  { to: '/roadmaps', label: 'Roadmaps', ico: '🗺️' },
  { to: '/shortlist', label: 'Shortlist', ico: '⭐' },
  { to: '/me', label: 'Me', ico: '👤' },
];

// S23: offline and sync states. Opened content keeps working; quiz results and sharing need a
// connection (those screens say so where it matters). Changes made offline queue and sync later.
function useSyncStatus() {
  const online = useOnline();
  const lastSynced = useStore((s) => s.lastSynced);
  const pending = useStore((s) => s.pendingSync);
  const markSynced = useStore((s) => s.markSynced);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!online) return;
    if (pending > 0) {
      setSyncing(true);
      const id = setTimeout(() => { markSynced(); setSyncing(false); }, 1200);
      return () => clearTimeout(id);
    }
    markSynced();
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!online) {
    const queued = pending > 0 ? ` · ${pending} change${pending > 1 ? 's' : ''} waiting to sync` : '';
    return { cls: 'statusbar', text: `⚠ Offline · last synced ${agoShort(lastSynced)}${queued}. Opened cards still work.` };
  }
  if (syncing) return { cls: 'statusbar sync', text: 'Syncing…' };
  return null;
}

export function Shell() {
  const { pathname } = useLocation();
  const status = useSyncStatus();
  // The quiz runs full-focus: no tab bar while answering.
  const focus = pathname.startsWith('/quiz/run');
  return (
    <div className="shell" style={{ '--sb': status ? '34px' : '0px' }}>
      {!focus && (
        <nav className="tabbar" aria-label="Main">
          <div className="brand-mark">🧭 CareerQuest</div>
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="tab">
              <span className="ico" aria-hidden="true">{t.ico}</span>
              <span>{t.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {status && <div className={status.cls} role="status">{status.text}</div>}
        <main className={`main${focus ? ' no-nav' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
