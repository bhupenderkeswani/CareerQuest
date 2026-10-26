import { useState } from 'react';
import { useStore } from '../store';
import { BADGES } from '../lib/badges';
import { BadgeDetail } from '../components/Overlays';
import { TopBar } from '../components/TopBar';

// S18: every badge with its rule. Locked badges are visible, greyed, with a hint.
export default function Badges() {
  const badges = useStore((s) => s.badges);
  const [open, setOpen] = useState(null);
  const count = Object.keys(badges).length;
  return (
    <div className="stack">
      <TopBar title={`Badges (${count}/${BADGES.length})`} backTo="/me" />
      <p className="muted">Badges reward breadth and curiosity. Tap any badge to see how to earn it.</p>
      <div className="badgegrid">
        {BADGES.map((b) => {
          const on = Boolean(badges[b.id]);
          return (
            <button key={b.id} className={`badge-tile${on ? '' : ' locked'}`} onClick={() => setOpen(b.id)} aria-label={`${b.name}, ${on ? 'unlocked' : 'locked'}`}>
              <div className="ic" aria-hidden="true">{b.icon}</div>
              <div className="nm">{b.name}</div>
            </button>
          );
        })}
      </div>
      {open && <BadgeDetail id={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
