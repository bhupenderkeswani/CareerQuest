import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import { downloadExport } from './Settings';

// Account deletion: says exactly what is erased and offers export first.
export default function DeleteAccount() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const exportData = useStore((s) => s.exportData);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const pushToast = useStore((s) => s.pushToast);

  return (
    <div className="stack-lg">
      <TopBar title={`Delete ${user ? 'account' : 'data'}`} backTo="/settings" />
      <div className="stack">
        <h2>This can’t be undone</h2>
        <p>Deleting will erase:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {user && <li>Your profile (nickname, class, state)</li>}
          <li>Your shortlist and compare picks</li>
          <li>Your XP, level and badges</li>
          <li>Your quiz answers and recommendations</li>
          <li>Your roadmap progress and error reports</li>
        </ul>
        <p className="muted">You can export a copy of everything first.</p>
      </div>
      <div className="stack">
        <button className="btn block" onClick={() => { downloadExport(exportData()); pushToast('Your data was downloaded.', 'info'); }}>Export my data first</button>
        <button className="btn danger block" onClick={() => { deleteAccount(); nav('/welcome', { replace: true }); }}>Delete everything</button>
        <button className="btn block" onClick={() => nav('/settings')}>Cancel</button>
      </div>
    </div>
  );
}
