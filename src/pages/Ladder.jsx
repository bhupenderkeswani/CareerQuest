import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, useRole } from '../store';
import { CAREER_MAP } from '../data/careers';
import { hasRoadmap } from '../data/roadmaps';
import { ladderFor, sharedLevels } from '../data/ladders';
import { track } from '../lib/analytics';
import { TopBar } from '../components/TopBar';

function Level({ role, level, index, open, onToggle }) {
  const openInfo = useStore((s) => s.openInfo);
  const openFieldInfo = useStore((s) => s.openFieldInfo);
  return (
    <li className="step">
      <span className="node" aria-hidden="true">{index + 1}</span>
      <div className="card">
        <button className="levelhead" aria-expanded={open} onClick={onToggle}>
          <span>
            <strong>{level.title}</strong>
            <span className="small muted" style={{ display: 'block' }}>{level.when} · {level.pay.value}</span>
          </span>
          <span className="muted" aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        {open && (
          <div className="stack" style={{ marginTop: 12 }}>
            <div className="fieldrow" style={{ padding: 0, borderBottom: 0 }}>
              <div className="grow">
                <div className="lbl-s">{level.pay.label}</div>
                <div className="val">{level.pay.value}</div>
              </div>
              <button
                className="infobtn"
                aria-label={`Where does the pay for ${level.title} come from?`}
                onClick={() => {
                  openFieldInfo(`${role.id}.ladder.${level.id}`);
                  openInfo({ roleId: role.id, custom: { title: `${level.title}: typical pay`, value: level.pay.value, source: level.pay.source, updated: level.pay.updated } });
                }}
              >
                ⓘ
              </button>
            </div>
            <div><div className="lbl-s small muted">What you do</div><div>{level.does}</div></div>
            <div>
              <div className="lbl-s small muted" style={{ marginBottom: 4 }}>Skills to build</div>
              <div className="row wrap" style={{ gap: 6 }}>{level.skills.map((s) => <span key={s} className="tag brand">{s}</span>)}</div>
            </div>
            <div><div className="lbl-s small muted">To move up</div><div>{level.moveUp}</div></div>
          </div>
        )}
      </div>
    </li>
  );
}

// How a role grows after the first job. Tracks fork where careers really split.
export default function Ladder() {
  const { id } = useParams();
  const role = useRole(id);
  const found = ladderFor(id);
  const [trackId, setTrackId] = useState(null);
  const [open, setOpen] = useState(() => new Set());

  useEffect(() => { if (found) track('ladder_open', { role: id }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setTrackId(null); setOpen(new Set()); }, [id]);

  if (!role) return <div className="stack"><TopBar title="Not found" backTo="/" /><p className="muted">We couldn’t find that career.</p></div>;
  if (!found) {
    return (
      <div className="stack-lg">
        <TopBar title={role.name} backTo={`/career/${id}`} />
        <div className="card soft center stack">
          <div className="bigicon" aria-hidden="true">📈</div>
          <h2>Career ladder coming soon</h2>
          <p>We’re still checking titles, timing and pay for {role.name}.</p>
          <Link className="btn block" to={`/career/${id}`}>Back to the {role.name} card</Link>
        </div>
      </div>
    );
  }

  const { ladder, inheritedFrom } = found;
  const parent = inheritedFrom ? CAREER_MAP[inheritedFrom] : null;
  const track_ = ladder.tracks.find((t) => t.id === trackId) || ladder.tracks[0];
  const split = ladder.tracks.length > 1 ? sharedLevels(ladder) : -1;
  const toggle = (lid) => setOpen((prev) => { const n = new Set(prev); n.has(lid) ? n.delete(lid) : n.add(lid); return n; });
  const allOpen = track_.levels.every((l) => open.has(l.id));

  return (
    <div className="stack">
      <TopBar title={`${role.name}: career ladder`} backTo={`/career/${id}`} />

      <div className="card soft stack">
        <p>Where this role can grow <strong>after your first job</strong>. Titles, timing and pay vary a lot by company, so use this as a rough map, not a promise.</p>
        {parent && <p className="small">This ladder is shared with <Link to={`/career/${parent.id}`}>{parent.name}</Link>. Exact titles differ for {role.name}.</p>}
        {hasRoadmap(id) && <p className="small">Getting in? See the <Link to={`/roadmap/${id}`}>roadmap</Link>. It ends where this ladder begins.</p>}
      </div>

      {ladder.tracks.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Career directions">
          {ladder.tracks.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === track_.id} onClick={() => setTrackId(t.id)}>{t.name}</button>
          ))}
        </div>
      )}

      <div className="row spread">
        <span className="small muted">{track_.levels.length} levels</span>
        <button className="linkbtn small" onClick={() => setOpen(allOpen ? new Set() : new Set(track_.levels.map((l) => l.id)))}>{allOpen ? 'Collapse all' : 'Expand all'}</button>
      </div>

      <ol className="steps">
        {track_.levels.flatMap((level, i) => [
          i === split && (
            <li key={`split-${i}`} className="split">🔀 The paths split here. Pick the direction that suits you.</li>
          ),
          <Level key={level.id} role={role} level={level} index={i} open={open.has(level.id)} onToggle={() => toggle(level.id)} />,
        ]).filter(Boolean)}
      </ol>

      <p className="proto-note">Pay at each level is an editorial estimate, not a checked figure. Confirm before you decide.</p>
    </div>
  );
}
