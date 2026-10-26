import { Link, useNavigate } from 'react-router-dom';
import { useStore, useRoles } from '../store';

export const useSynced = () => {
  const user = useStore((s) => s.user);
  return Boolean(user && (!user.minor || user.consent === 'approved'));
};

// S16: saved roles. Synced for accounts in good standing, otherwise kept on this device.
export default function Shortlist() {
  const nav = useNavigate();
  const ids = useStore((s) => s.shortlist);
  const toggle = useStore((s) => s.toggleShortlist);
  const setCompare = useStore((s) => s.setCompare);
  const roles = useRoles(ids);
  const synced = useSynced();

  return (
    <div className="stack-lg" style={{ paddingTop: 16 }}>
      <div>
        <h1>Shortlist</h1>
        <p className="small muted">{synced ? '✓ Synced to your account' : 'Saved on this device only. Create an account to keep it safe.'}</p>
      </div>

      {roles.length === 0 ? (
        <div className="card soft center stack">
          <div className="bigicon" aria-hidden="true">⭐</div>
          <h2>Nothing saved yet</h2>
          <p>Tap the heart on a career card to keep it here.</p>
          <Link className="btn primary" to="/">Explore careers</Link>
        </div>
      ) : (
        <>
          <ul className="list card">
            {roles.map((r) => (
              <li key={r.id} className="row" style={{ padding: '12px 0' }}>
                <Link to={`/career/${r.id}`} className="row grow" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ fontSize: '1.7rem' }} aria-hidden="true">{r.emoji}</span>
                  <span><strong>{r.name}</strong><span className="small muted" style={{ display: 'block' }}>{r.fields.salary.label}: {r.fields.salary.value}</span></span>
                </Link>
                <button className="btn sm" aria-label={`Remove ${r.name} from shortlist`} onClick={() => toggle(r.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button className="btn primary block" disabled={roles.length < 2} onClick={() => { setCompare(ids); nav('/compare'); }}>
            {roles.length < 2 ? 'Save one more to compare' : `Compare ${Math.min(3, roles.length)} of these`}
          </button>
        </>
      )}
    </div>
  );
}
