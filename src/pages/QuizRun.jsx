import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, useOnline } from '../store';
import { QUESTIONS } from '../data/quiz';
import { recommend } from '../lib/recommend';
import { track } from '../lib/analytics';

// S11: one question per screen. Answers save as you go, so an abandoned quiz can be resumed.
export default function QuizRun() {
  const nav = useNavigate();
  const online = useOnline();
  const saved = useStore((s) => s.quiz);
  const save = useStore((s) => s.saveQuizProgress);
  const complete = useStore((s) => s.completeQuiz);

  // Editing a finished quiz starts from the first question with answers prefilled.
  const [step, setStep] = useState(saved.completedAt ? 0 : Math.min(saved.step, QUESTIONS.length - 1));
  const [answers, setAnswers] = useState(saved.answers);
  const [phase, setPhase] = useState('ask'); // ask | thinking | offline
  const finished = useRef(false);
  const latest = useRef({ answers, step });
  latest.current = { answers, step };

  const timer = useRef(null);

  useEffect(() => () => {
    clearTimeout(timer.current);
    if (!finished.current && Object.keys(latest.current.answers).length) track('quiz_abandon', { at: latest.current.step + 1 });
  }, []);

  const q = QUESTIONS[step];
  const value = answers[q.id];
  const answered = q.type === 'multi' ? Array.isArray(value) && value.length > 0 : value !== undefined;

  const pick = (v) => {
    setAnswers((a) => {
      if (q.type === 'single') return { ...a, [q.id]: v };
      const cur = a[q.id] || [];
      if (cur.includes(v)) return { ...a, [q.id]: cur.filter((x) => x !== v) };
      if (q.max && cur.length >= q.max) return { ...a, [q.id]: [...cur.slice(1), v] };
      return { ...a, [q.id]: [...cur, v] };
    });
  };

  const finish = (finalAnswers) => {
    if (!online) { save(finalAnswers, step); setPhase('offline'); return; }
    setPhase('thinking');
    // A hosted model would be called here. On any failure the rule-based matcher answers with
    // the same UI and no error text, so students never see a difference.
    timer.current = setTimeout(() => {
      finished.current = true;
      complete(finalAnswers, recommend(finalAnswers));
      nav('/foryou', { replace: true });
    }, 1400);
  };

  const next = (skip = false) => {
    const a = skip && !answered ? { ...answers } : answers;
    if (answered) track('quiz_question_answered', { q: q.id });
    if (step === QUESTIONS.length - 1) return finish(a);
    save(a, step + 1);
    setStep(step + 1);
  };
  const back = () => {
    if (step === 0) return nav('/quiz');
    save(answers, step - 1);
    setStep(step - 1);
  };

  if (phase === 'thinking') {
    return (
      <div className="center stack-lg" style={{ paddingTop: 80 }} role="status">
        <div className="spinner" />
        <h2>Finding roles worth exploring…</h2>
        <p className="muted">Matching your answers to our career cards.</p>
      </div>
    );
  }
  if (phase === 'offline') {
    return (
      <div className="center stack-lg" style={{ paddingTop: 60 }}>
        <div className="bigicon" aria-hidden="true">📡</div>
        <h2>You’re offline</h2>
        <p className="muted">Your answers are saved. Connect to the internet to see your picks.</p>
        <button className="btn primary" disabled={!online} onClick={() => finish(answers)}>Try again</button>
      </div>
    );
  }

  const last = step === QUESTIONS.length - 1;
  return (
    <div>
      <div className="topbar">
        <button className="iconbtn" aria-label="Previous question" onClick={back}>←</button>
        <h1>Question {step + 1} of {QUESTIONS.length}</h1>
      </div>
      <div className="progress qprogress" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1}>
        <i style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      <h2 className="qtitle">{q.title}</h2>
      {q.help && <p className="muted small">{q.help}</p>}

      <div className="options" role={q.type === 'single' ? 'radiogroup' : 'group'} aria-label={q.title}>
        {q.options.map((o) => {
          const on = q.type === 'single' ? value === o.v : (value || []).includes(o.v);
          return (
            <button key={String(o.v)} className={`radio${q.type === 'multi' ? ' square' : ''}`} role={q.type === 'single' ? 'radio' : 'checkbox'} aria-checked={on} onClick={() => pick(o.v)}>
              <span className="dot">{on ? (q.type === 'multi' ? '✓' : '•') : ''}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>

      <div className="row spread">
        <button className="btn primary" style={{ flex: 1 }} disabled={!answered && !q.optional} onClick={() => next()}>{last ? 'See my picks' : 'Next'}</button>
        <button className="linkbtn" style={{ padding: '0 16px' }} onClick={() => next(true)}>Skip</button>
      </div>
    </div>
  );
}
