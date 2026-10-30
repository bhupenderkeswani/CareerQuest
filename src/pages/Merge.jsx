import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { syncNow } from '../lib/account';

// S5: shown only when guest data exists on this device at first login.
export default function Merge() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const shortlist = useStore((s) => s.shortlist.length);
  const xp = useStore((s) => s.xp);
  const badges = useStore((s) => Object.keys(s.badges).length);
  const [busy, setBusy] = useState(false);
  const mergeAccept = useStore((s) => s.mergeAccept);
  const mergeFresh = useStore((s) => s.mergeFresh);

  if (!user) return <Navigate to="/welcome" replace />;
  // Merging or dropping happens first, then the account copy is saved or pulled, then on to the quiz invite.
  const go = async (prepare) => {
    setBusy(true);
    prepare();
    await syncNow();
    nav(useStore.getState().quiz.completedAt ? '/' : '/quiz', { replace: true });
  };

  return (
    <div className="onboard stack-lg">
      <div className="stack">
        <h1>Welcome back, {user.nickname}! 👋</h1>
        <p>We found this on this device:</p>
      </div>
      <ul className="card flat list" style={{ padding: '4px 16px' }}>
        <li style={{ padding: '12px 0' }}>★ {shortlist} saved career{shortlist === 1 ? '' : 's'}</li>
        <li style={{ padding: '12px 0' }}>⚡ {xp} XP <span className="muted small">(daily cap applies)</span></li>
        <li style={{ padding: '12px 0' }}>🏅 {badges} badge{badges === 1 ? '' : 's'}</li>
      </ul>
      <div className="stack">
        <button className="btn primary block" disabled={busy} onClick={() => go(mergeAccept)}>{busy ? 'Saving…' : 'Add to my account'}</button>
        <button className="btn block" disabled={busy} onClick={() => go(mergeFresh)}>Start fresh instead</button>
      </div>
    </div>
  );
}
