import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, useRoles } from '../store';
import { CAREERS, CAREER_MAP } from '../data/careers';
import { FIELDS } from '../lib/config';
import { CareerTile } from '../components/CareerTile';

// Round-robin across fields so no field, and no pay band, reads as ranked first.
function interleave(roles) {
  const groups = {};
  roles.forEach((r) => (groups[r.field] ||= []).push(r));
  const lists = Object.values(groups);
  const out = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
}

// S6: Explore home.
export default function Explore() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const xp = useStore((s) => s.xp);
  const recs = useStore((s) => s.recs);
  const quiz = useStore((s) => s.quiz);
  const compare = useStore((s) => s.compare);
  const clearCompare = useStore((s) => s.clearCompare);
  const roles = useRoles(CAREERS.map((c) => c.id));
  const [field, setField] = useState('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    // Browsing shows top-level roles; searching also finds specialisations like Surgeon or Backend Developer.
    const pool = term ? roles : roles.filter((r) => !r.parent);
    const match = (r) => r.name.toLowerCase().includes(term) || r.tagline.toLowerCase().includes(term) || (r.parent && CAREER_MAP[r.parent].name.toLowerCase().includes(term));
    return interleave(pool).filter((r) => (field === 'all' || r.field === field) && (!term || match(r)));
  }, [roles, field, q]);

  const top = recs[0] && CAREER_MAP[recs[0].roleId];
  const answered = Object.keys(quiz.answers).length;

  return (
    <div className="stack-lg">
      <div className="row spread" style={{ paddingTop: 16 }}>
        <h1>Hi {user?.nickname || 'there'}</h1>
        <button className="xp-chip" onClick={() => nav('/me')} aria-label={`${xp} XP. Open your profile`}>⚡ {xp} XP</button>
      </div>

      <Link to={top ? '/foryou' : '/quiz'} className="banner">
        <small>Roles worth exploring</small>
        <strong>{top ? `Top pick for you: ${top.name}` : answered > 0 ? 'Continue your quiz →' : 'Take the 3-minute quiz →'}</strong>
        <small>{top ? 'See all your picks and why they fit' : 'Get 3–5 roles with reasons, no wrong answers'}</small>
      </Link>

      <Link to="/chat" className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">💬</span>
        <span className="grow"><strong>Tell us what you want</strong><span className="small muted" style={{ display: 'block' }}>Say it in your own words, like “good at maths, want 20 lakh a year”</span></span>
        <span aria-hidden="true">→</span>
      </Link>

      <div className="stack">
        <input className="field-input" type="search" placeholder="Search careers and specialisations" aria-label="Search careers and specialisations" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter by field">
          <button className="chip" aria-pressed={field === 'all'} onClick={() => setField('all')}>All</button>
          {Object.values(FIELDS).map((f) => (
            <button key={f.id} className="chip" aria-pressed={field === f.id} onClick={() => setField(f.id)}>{f.emoji} {f.label}</button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <div className="grid">{shown.map((r) => <CareerTile key={r.id} role={r} />)}</div>
      ) : (
        <p className="muted center" style={{ padding: 24 }}>No careers match “{q}”. Try a different word.</p>
      )}

      {compare.length > 0 && (
        <div className="compare-tray" role="region" aria-label="Compare tray">
          <span>Compare tray: <strong>{compare.length}</strong> selected</span>
          <button className="btn primary sm" disabled={compare.length < 2} onClick={() => nav('/compare')}>
            {compare.length < 2 ? 'Pick one more' : 'Compare'}
          </button>
          <button className="linkbtn" onClick={clearCompare}>Clear</button>
        </div>
      )}
    </div>
  );
}
