import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { deleteAccountRemote } from '../lib/account';
import { TopBar } from '../components/TopBar';
import { downloadExport } from './Settings';

// Account deletion: says exactly what is erased and offers export first. For a signed-in student this removes the
// account on the server too, not just what is on this device.
export default function DeleteAccount() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const exportData = useStore((s) => s.exportData);
  const deleteLocal = useStore((s) => s.deleteAccount);
  const pushToast = useStore((s) => s.pushToast);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setBusy(true); setError('');
    try {
      if (user) await deleteAccountRemote(); else deleteLocal();
      nav('/welcome', { replace: true });
    } catch (e) {
      setError(e.message || 'Could not delete the account. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <div className="stack-lg">
      <TopBar title={`Delete ${user ? 'account' : 'data'}`} backTo="/settings" />
      <div className="stack">
        <h2>This can’t be undone</h2>
        <p>Deleting will erase{user ? ' from your account and this device' : ' from this device'}:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {user && <li>Your sign-in and profile (nickname, class, state)</li>}
          {user && user.minor && <li>The record of your guardian’s approval</li>}
          <li>Your shortlist and compare picks</li>
          <li>Your XP, level and badges</li>
          <li>Your quiz answers and recommendations</li>
          <li>Your roadmap progress</li>
        </ul>
        <p className="muted">You can export a copy of everything first.</p>
      </div>
      {error && <div className="err" role="alert">{error}</div>}
      <div className="stack">
        <button className="btn block" onClick={() => { downloadExport(exportData()); pushToast('Your data was downloaded.', 'info'); }}>Export my data first</button>
        <button className="btn danger block" disabled={busy} onClick={remove}>{busy ? 'Deleting…' : 'Delete everything'}</button>
        <button className="btn block" onClick={() => nav('/settings')}>Cancel</button>
      </div>
    </div>
  );
}
