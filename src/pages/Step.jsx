import { Link, useParams } from 'react-router-dom';
import { useStore, useOnline } from '../store';
import { ROADMAPS, findStep, visibleSteps } from '../data/roadmaps';
import { fmtDuration, fmtMoney } from '../lib/freshness';
import { XP_RULES } from '../lib/config';
import { TopBar } from '../components/TopBar';

// S14: one roadmap step. Marking it done earns XP once per step and syncs to the account.
export default function Step() {
  const { id, stepId } = useParams();
  const found = findStep(id, stepId);
  const done = useStore((s) => s.progress[id]?.[stepId]);
  const complete = useStore((s) => s.completeStep);
  const undo = useStore((s) => s.undoStep);
  const openInfo = useStore((s) => s.openInfo);
  const openFieldInfo = useStore((s) => s.openFieldInfo);
  const startStage = useStore((s) => s.startStage);
  const activePath = useStore((s) => s.activePath[id]);
  const online = useOnline();

  if (!found) {
    return <div className="stack"><TopBar title="Step not found" backTo={`/roadmap/${id}`} /><p className="muted">That step doesn’t exist.</p></div>;
  }
  const { step } = found;
  const pathId = ROADMAPS[id].paths.some((p) => p.id === activePath) ? activePath : ROADMAPS[id].paths[0].id;
  const list = visibleSteps(id, pathId, startStage);
  const idx = list.findIndex((s) => s.id === stepId);
  const next = idx >= 0 ? list[idx + 1] : null;

  const rows = [
    ['Type', step.type],
    ['Duration', fmtDuration(step.dur[0], step.dur[1])],
    ['Cost', step.cost ? fmtMoney(step.cost[0], step.cost[1]) : 'No fixed fee (varies)'],
    ['Eligibility', step.eligibility],
  ];

  return (
    <div className="stack">
      <TopBar title={step.title} backTo={`/roadmap/${id}`} />
      <div className="card">
        {rows.map(([k, v]) => (
          <div className="fieldrow" key={k}>
            <div className="grow"><div className="lbl-s">{k}</div><div className="val">{v}</div></div>
          </div>
        ))}
        <div className="fieldrow">
          <div className="grow">
            <div className="lbl-s">Source</div>
            <div className="meta">
              <span>{step.source}</span>
            </div>
          </div>
          <button className="infobtn" aria-label="Source and freshness for this step"
            onClick={() => { openFieldInfo(`${id}.step.${stepId}`); openInfo({ roleId: id, custom: { title: step.title, value: `${step.type}. ${step.eligibility}`, source: step.source, updated: step.updated } }); }}>ⓘ</button>
        </div>
      </div>

      <div className="card flat">
        <strong>What to do next</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
          {step.todo.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>

      {done ? (
        <div className="stack">
          <div className="card soft center"><strong>✓ Done</strong></div>
          {next && <Link className="btn primary block" to={`/roadmap/${id}/step/${next.id}`}>Next: {next.title} →</Link>}
          <button className="linkbtn" style={{ alignSelf: 'center' }} onClick={() => undo(id, stepId)}>Undo (you keep your XP)</button>
        </div>
      ) : (
        <div className="stack">
          <button className="btn primary block" onClick={() => complete(id, stepId)}>Mark as done +{XP_RULES.roadmap_step.xp} XP</button>
          {!online && <p className="small muted center">You’re offline. This will sync when you’re back online.</p>}
        </div>
      )}
      <Link to={`/roadmap/${id}`} className="center">Back to roadmap</Link>
    </div>
  );
}
