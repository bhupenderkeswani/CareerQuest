import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, useRole } from '../store';
import { CAREER_MAP } from '../data/careers';
import { ROADMAPS, STAGES, pathTotals, visibleSteps } from '../data/roadmaps';
import { fmtDuration, fmtMoney } from '../lib/freshness';
import { track } from '../lib/analytics';
import { hasLadder, ladderChain } from '../data/ladders';
import { TopBar } from '../components/TopBar';

export function stepMeta(s) {
  const bits = [s.type, fmtDuration(s.dur[0], s.dur[1])];
  if (s.cost) bits.push(fmtMoney(s.cost[0], s.cost[1]));
  return bits.join(' · ');
}

// S13: roadmap timeline from the student's current stage, with alternate path tabs.
export default function Roadmap() {
  const { id } = useParams();
  const role = useRole(id);
  const rm = ROADMAPS[id];
  const startStage = useStore((s) => s.startStage);
  const setStartStage = useStore((s) => s.setStartStage);
  const activePath = useStore((s) => s.activePath[id]);
  const setActivePath = useStore((s) => s.setActivePath);
  const done = useStore((s) => s.progress[id]) || {};

  useEffect(() => { if (rm) track('roadmap_open', { role: id }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!role) return <div className="stack"><TopBar title="Not found" backTo="/roadmaps" /><p className="muted">That roadmap doesn’t exist.</p></div>;
  if (!rm) {
    return (
      <div className="stack-lg">
        <TopBar title={role.name} backTo="/roadmaps" />
        <div className="card soft center stack">
          <div className="bigicon" aria-hidden="true">🗺</div>
          <h2>Roadmap coming soon</h2>
          <p>We’re still checking exams, costs and eligibility for {role.name}. Roadmaps are reviewed before they’re published.</p>
          <Link className="btn block" to={`/career/${id}`}>Back to the {role.name} card</Link>
        </div>
      </div>
    );
  }

  const pathId = rm.paths.some((p) => p.id === activePath) ? activePath : rm.paths[0].id;
  const steps = visibleSteps(id, pathId, startStage);
  const doneCount = steps.filter((s) => done[s.id]).length;
  const t = pathTotals(steps);
  const yrs = (m) => +(m / 12).toFixed(1);

  return (
    <div className="stack">
      <TopBar title={role.name} backTo={`/career/${id}`} />

      <div className="row">
        <label htmlFor="start" className="small muted">Starting from:</label>
        <select id="start" className="field-input" style={{ width: 'auto', minHeight: 40 }} value={startStage} onChange={(e) => setStartStage(Number(e.target.value))}>
          {STAGES.map((s, i) => <option key={s.id} value={i}>{s.label}</option>)}
        </select>
      </div>

      <div>
        <div className="row spread small"><span>Progress {doneCount}/{steps.length}</span></div>
        <div className="progress" style={{ marginTop: 6 }} role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount}>
          <i style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }} />
        </div>
      </div>

      {rm.paths.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Alternate paths">
          {rm.paths.map((p) => (
            <button key={p.id} role="tab" aria-selected={p.id === pathId} onClick={() => setActivePath(id, p.id)}>{p.name}</button>
          ))}
        </div>
      )}

      <ol className="steps">
        {steps.map((s, i) => {
          const isDone = Boolean(done[s.id]);
          return (
            <li key={s.id} className={`step${isDone ? ' done' : ''}`}>
              <span className="node" aria-hidden="true">{isDone ? '✓' : i + 1}</span>
              <Link className="card" to={`/roadmap/${id}/step/${s.id}`} aria-label={`${s.title}${isDone ? ', done' : ''}`}>
                <strong>{s.title}</strong>
                <div className="small muted">{stepMeta(s)}</div>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="card flat">
        <strong>Total: about {yrs(t.dMin) === yrs(t.dMax) ? `${yrs(t.dMin)}` : `${yrs(t.dMin)}–${yrs(t.dMax)}`} years</strong>
        <span className="muted"> · {t.cMax > 0 ? `${fmtMoney(t.cMin, t.cMax)} (approximate)` : 'costs vary'}</span>
        <p className="small muted" style={{ marginTop: 4 }}>Exam preparation that runs alongside school isn’t added to the time.</p>
      </div>

      {hasLadder(id) && (
        <Link to={`/career/${id}/ladder`} className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📈</span>
          <span className="grow">
            <strong>After your first job</strong>
            <span className="small muted" style={{ display: 'block' }}>See the career ladder: {ladderChain(id)}</span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <section aria-labelledby="mind">
        <div className="sectionhead"><h2 id="mind">🔀 If you change your mind</h2></div>
        <p className="small muted" style={{ marginBottom: 10 }}>Some of what you learn on this path carries over to other roles.</p>
        <div className="stack">
          {role.sideQuests.map((sq) => {
            const to = CAREER_MAP[sq.to];
            return (
              <Link key={sq.to} to={`/career/${sq.to}`} className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontSize: '1.6rem' }} aria-hidden="true">{to.emoji}</span>
                <span className="grow"><strong>{to.name}</strong><span className="small muted" style={{ display: 'block' }}>Carries over: {sq.carries}</span></span>
                <span aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
