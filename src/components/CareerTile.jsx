import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { FIELDS } from '../lib/config';
import { CAREER_MAP, CHILDREN } from '../data/careers';

export function CareerTile({ role, withCompare = true }) {
  const inCompare = useStore((s) => s.compare.includes(role.id));
  const toggleCompare = useStore((s) => s.toggleCompare);
  const pushToast = useStore((s) => s.pushToast);
  const field = FIELDS[role.field];
  const kids = CHILDREN[role.id]?.length || 0;
  const parent = role.parent ? CAREER_MAP[role.parent] : null;
  const note = kids ? ` · ${kids} specialisations` : parent ? ` · ${parent.name}` : '';

  const onPick = () => {
    if (!toggleCompare(role.id)) pushToast('You can compare up to 3 careers.', 'info');
  };

  return (
    <div className={`tile field-${role.field}`}>
      <Link to={`/career/${role.id}`} className="open" aria-label={`Open ${role.name}`}>
        <div className="art" style={{ background: `hsl(${role.hue} 75% 92%)` }} aria-hidden="true">{role.emoji}</div>
        <div className="body">
          <div className="name">{role.name}</div>
          <div className="sub"><span className="field-dot" style={{ background: 'var(--fc)' }} /> {field.label}{note}</div>
        </div>
      </Link>
      {withCompare && (
        <div className="pick">
          <button className="pickbtn" aria-pressed={inCompare} onClick={onPick}>
            {inCompare ? '✓ Compare' : '+ Compare'}
          </button>
        </div>
      )}
    </div>
  );
}
