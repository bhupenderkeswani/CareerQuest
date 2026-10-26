import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, useRoles } from '../store';
import { QUESTIONS } from '../data/quiz';
import { track } from '../lib/analytics';
import { CHILDREN } from '../data/careers';

function RecCard({ rec, role }) {
  const nav = useNavigate();
  const inCompare = useStore((s) => s.compare.includes(role.id));
  const toggleCompare = useStore((s) => s.toggleCompare);
  const setRecFeedback = useStore((s) => s.setRecFeedback);
  const pushToast = useStore((s) => s.pushToast);
  const field = role.fields;

  return (
    <article className="card rec">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <span className="rank" aria-hidden="true">{rec.rank}</span>
        <div className="grow">
          <h2>{role.emoji} {role.name}</h2>
          <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
            {rec.outside && <span className="tag brand">🔀 Outside your stream</span>}
          </div>
        </div>
      </div>
      <dl>
        <dt>Why it fits</dt>
        <dd>{rec.why}</dd>
        <dt>What to check</dt>
        <dd>{rec.check}</dd>
      </dl>
      {CHILDREN[role.id] && (
        <p className="small muted">Includes specialisations such as {CHILDREN[role.id].slice(0, 3).map((c) => c.name).join(', ')}. Open the card to see them.</p>
      )}
      <p className="small muted">{field.salary.label}: {field.salary.value} · {field.study.label}: {field.study.value}</p>
      <div className="row wrap" style={{ marginTop: 12 }}>
        <button className="btn sm primary" onClick={() => { track('rec_open', { role: role.id, rank: rec.rank }); nav(`/career/${role.id}`); }}>Open card</button>
        <button className="btn sm" aria-pressed={inCompare} onClick={() => { if (!toggleCompare(role.id)) pushToast('You can compare up to 3 careers.', 'info'); }}>
          {inCompare ? '✓ In Compare' : '+ Compare'}
        </button>
        <span className="grow" />
        <span className="small muted">Helpful?</span>
        <span className="thumbs row" style={{ gap: 6 }}>
          <button aria-label="Yes, helpful" aria-pressed={rec.feedback === 'up'} onClick={() => setRecFeedback(role.id, 'up')}>👍</button>
          <button aria-label="Not helpful" aria-pressed={rec.feedback === 'down'} onClick={() => setRecFeedback(role.id, 'down')}>👎</button>
        </span>
      </div>
    </article>
  );
}

// S12: personalised picks. Figures come only from curated role data, so the rule-based
// fallback and any AI ranking render identically.
export default function ForYou() {
  const quiz = useStore((s) => s.quiz);
  const recs = useStore((s) => s.recs);
  const roles = useRoles(recs.map((r) => r.roleId));

  useEffect(() => { if (recs.length) track('rec_view', { n: recs.length }); }, [recs.length]);

  const started = Object.keys(quiz.answers).length > 0;

  if (!quiz.completedAt || recs.length === 0) {
    return (
      <div className="stack-lg" style={{ paddingTop: 16 }}>
        <h1>For you</h1>
        <div className="card soft stack">
          <div style={{ fontSize: '2.4rem' }} aria-hidden="true">🎯</div>
          <h2>{started ? `Continue quiz (Q${quiz.step + 1})` : 'Roles worth exploring'}</h2>
          <p>{started ? 'Your answers are saved. Pick up where you left off.' : `Answer ${QUESTIONS.length} quick questions and get 3–5 roles with reasons. About 3 minutes.`}</p>
          <Link to={started ? '/quiz/run' : '/quiz'} className="btn primary block">{started ? 'Continue' : 'Take the quiz'}</Link>
        </div>
        <Link to="/chat" className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '1.5rem' }} aria-hidden="true">💬</span>
          <span className="grow"><strong>Or just tell us what you want</strong><span className="small muted" style={{ display: 'block' }}>Say it in your own words and get roles with links</span></span>
          <span aria-hidden="true">→</span>
        </Link>
        <p className="small muted">Prefer to browse? <Link to="/">Explore all careers</Link>.</p>
      </div>
    );
  }

  return (
    <div className="stack" style={{ paddingTop: 16 }}>
      <div>
        <h1>Roles worth exploring</h1>
        <p className="muted">Based on your answers. These are ideas to look into, not a verdict.</p>
      </div>
      {recs.map((rec) => {
        const role = roles.find((r) => r.id === rec.roleId);
        return role ? <RecCard key={rec.roleId} rec={rec} role={role} /> : null;
      })}
      <div className="row wrap center" style={{ justifyContent: 'center', gap: 18 }}>
        <Link to="/quiz/run">Edit my answers</Link>
        <Link to="/quiz">Retake</Link>
        <Link to="/chat">Ask in your own words</Link>
      </div>
      <p className="proto-note">Picks use only the figures on our career cards.</p>
    </div>
  );
}
