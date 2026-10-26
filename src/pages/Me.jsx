import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { BADGES } from '../lib/badges';
import { CLASS_STAGES, DAILY_CAP, levelInfo } from '../lib/config';
import { today } from '../lib/freshness';
import { CAREER_MAP } from '../data/careers';
import { useSynced } from './Shortlist';

// S17: profile with XP, level, today's progress, badges and account status.
export default function Me() {
  const user = useStore((s) => s.user);
  const xp = useStore((s) => s.xp);
  const daily = useStore((s) => s.daily);
  const badges = useStore((s) => s.badges);
  const quiz = useStore((s) => s.quiz);
  const progress = useStore((s) => s.progress);
  const approve = useStore((s) => s.approveGuardian);
  const synced = useSynced();
  const lvl = levelInfo(xp);
  const todayXp = daily.date === today() ? daily.xp : 0;

  const unlocked = BADGES.filter((b) => badges[b.id]);
  const locked = BADGES.filter((b) => !badges[b.id]);
  const preview = [...unlocked, ...locked].slice(0, 4);
  const active = Object.keys(progress).filter((id) => Object.keys(progress[id]).length > 0);
  const stage = user && CLASS_STAGES.find((c) => c.id === user.classStage)?.label;
  const pending = user && (user.consent === 'pending' || user.consent === 'required');

  return (
    <div className="stack-lg" style={{ paddingTop: 16 }}>
      <div className="row spread">
        <div>
          <h1>{user ? user.nickname : 'Guest'}</h1>
          <p className="small muted">{user ? stage : 'Not signed in'}</p>
        </div>
        <Link to="/settings" className="iconbtn" aria-label="Settings">⚙</Link>
      </div>

      <div className="card stack">
        <div className="row spread">
          <h2>Level {lvl.n} · {lvl.name}</h2>
          <span className="tag brand">⚡ {xp} XP</span>
        </div>
        <div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={lvl.pct} aria-label="Progress to next level"><i style={{ width: `${lvl.pct}%` }} /></div>
          <p className="small muted" style={{ marginTop: 6 }}>{lvl.next ? `${xp} / ${lvl.next.at} XP to Level ${lvl.next.n} (${lvl.next.name})` : 'Top level reached'}</p>
        </div>
        <p className="small">Today: <strong>{todayXp} / {DAILY_CAP} XP</strong></p>
      </div>

      <section aria-labelledby="bdg">
        <div className="sectionhead">
          <h2 id="bdg">Badges ({unlocked.length}/{BADGES.length})</h2>
          <Link to="/me/badges">See all</Link>
        </div>
        <div className="badgegrid compact">
          {preview.map((b) => (
            <Link key={b.id} to="/me/badges" className={`badge-tile${badges[b.id] ? '' : ' locked'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="ic" aria-hidden="true">{badges[b.id] ? b.icon : '🔒'}</div>
              <div className="nm">{b.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <ul className="list card">
        <li><Link className="listbtn" to="/quiz"><span>Quiz: {quiz.completedAt ? 'done' : Object.keys(quiz.answers).length ? 'in progress' : 'not started'}</span><span className="linkbtn">{quiz.completedAt ? 'Edit' : 'Open'}</span></Link></li>
        <li>
          <Link className="listbtn" to="/roadmaps">
            <span>My roadmaps ({active.length})</span>
            <span className="small muted">{active.map((id) => CAREER_MAP[id]?.emoji).join(' ')}</span>
          </Link>
        </li>
        {user && (
          <li className="listbtn" style={{ cursor: 'default' }}>
            <span>Account status</span>
            <span>{pending ? '⏳ Waiting for guardian' : synced ? '✓ Synced' : 'Signed in'}</span>
          </li>
        )}
      </ul>

      {pending && (
        <div className="card soft stack">
          <p className="small">Until your guardian says OK, you keep guest-level features and your progress stays on this device.</p>
          {user.consent === 'required' && <Link className="btn sm" to="/guardian">Send my guardian a link</Link>}
          <button className="btn sm" onClick={approve}>Demo: simulate guardian approval</button>
        </div>
      )}

      {!user && (
        <div className="card soft stack">
          <strong>Keep your progress</strong>
          <p className="small">Create an account to sync your shortlist, XP and badges across devices.</p>
          <Link to="/welcome" className="btn primary block">Sign up or log in</Link>
        </div>
      )}

      <p className="small center"><Link to="/admin">Reviewer queue (internal)</Link></p>
    </div>
  );
}
