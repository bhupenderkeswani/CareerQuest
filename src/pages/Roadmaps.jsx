import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { CAREERS, CAREER_MAP, TOP_LEVEL } from '../data/careers';
import { ROADMAPS, hasRoadmap, visibleSteps } from '../data/roadmaps';

// S15: roadmaps hub. Active roadmaps first, then all available.
export default function Roadmaps() {
  const progress = useStore((s) => s.progress);
  const startStage = useStore((s) => s.startStage);
  const activePath = useStore((s) => s.activePath);
  const withRoadmap = TOP_LEVEL.filter((c) => hasRoadmap(c.id));
  const without = TOP_LEVEL.filter((c) => !hasRoadmap(c.id));
  const subWith = CAREERS.filter((c) => c.parent && hasRoadmap(c.id));
  const active = CAREERS.filter((c) => hasRoadmap(c.id)).filter((c) => Object.keys(progress[c.id] || {}).length > 0);

  return (
    <div className="stack-lg" style={{ paddingTop: 16 }}>
      <div>
        <h1>Roadmaps</h1>
        <p className="muted">The steps from where you are now to a first job, with exams, costs and other routes.</p>
      </div>

      <section aria-labelledby="mine">
        <div className="sectionhead"><h2 id="mine">My roadmaps</h2></div>
        {active.length === 0 ? (
          <p className="muted card flat">You haven’t started one yet. Pick a role below and mark your first step.</p>
        ) : (
          <div className="stack">
            {active.map((c) => {
              const pathId = activePath[c.id] || ROADMAPS[c.id].paths[0].id;
              const steps = visibleSteps(c.id, pathId, startStage);
              const done = steps.filter((s) => progress[c.id][s.id]).length;
              const total = steps.length;
              return (
                <Link key={c.id} to={`/roadmap/${c.id}`} className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ fontSize: '1.8rem' }} aria-hidden="true">{c.emoji}</span>
                  <span className="grow">
                    <strong>{c.name}</strong>
                    <span className="small muted" style={{ display: 'block' }}>{done} of {total} steps done</span>
                    <span className="progress" style={{ display: 'block', marginTop: 6 }}><i style={{ width: `${(done / Math.max(total, 1)) * 100}%` }} /></span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="all">
        <div className="sectionhead"><h2 id="all">All roadmaps</h2></div>
        <ul className="list card">
          {withRoadmap.map((c) => (
            <li key={c.id}>
              <Link className="listbtn" to={`/roadmap/${c.id}`}>
                <span className="row"><span aria-hidden="true">{c.emoji}</span> {c.name}</span><span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
          {without.map((c) => (
            <li key={c.id}>
              <Link className="listbtn muted" to={`/roadmap/${c.id}`}>
                <span className="row"><span aria-hidden="true">{c.emoji}</span> {c.name}</span><span className="tag">Coming soon</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="specs">
        <div className="sectionhead"><h2 id="specs">Specialisation roadmaps</h2></div>
        <p className="small muted" style={{ marginBottom: 10 }}>These share the first steps of their main career, then branch.</p>
        <ul className="list card">
          {subWith.map((c) => (
            <li key={c.id}>
              <Link className="listbtn" to={`/roadmap/${c.id}`}>
                <span className="row"><span aria-hidden="true">{c.emoji}</span><span>{c.name}<span className="small muted" style={{ display: 'block' }}>Part of {CAREER_MAP[c.parent].name}</span></span></span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
