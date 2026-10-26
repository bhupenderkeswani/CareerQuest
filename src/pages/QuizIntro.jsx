import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { QUESTIONS } from '../data/quiz';
import { track } from '../lib/analytics';
import { TopBar } from '../components/TopBar';

// S10: sets the 3-minute expectation and states what the quiz never uses.
export default function QuizIntro() {
  const nav = useNavigate();
  const quiz = useStore((s) => s.quiz);
  const resetQuiz = useStore((s) => s.resetQuiz);
  const inProgress = !quiz.completedAt && Object.keys(quiz.answers).length > 0;
  const done = Boolean(quiz.completedAt);

  const start = (fresh) => {
    if (fresh) resetQuiz();
    track('quiz_start', { resumed: !fresh && inProgress });
    nav('/quiz/run');
  };

  return (
    <div className="stack-lg">
      <TopBar title="Interest quiz" backTo="/foryou" />
      <div className="stack">
        <div className="hero-mark" aria-hidden="true" style={{ textAlign: 'left' }}>🎯</div>
        <h1>Find roles worth exploring</h1>
        <p>{QUESTIONS.length} questions · about 3 minutes. There are no right answers.</p>
        <div className="card soft">
          <strong>What we never use</strong>
          <p className="small">Caste, religion, gender or family income. We ask about what you like and what feels comfortable.</p>
        </div>
      </div>
      <div className="stack">
        {inProgress ? (
          <>
            <button className="btn primary block" onClick={() => start(false)}>Continue quiz (Q{quiz.step + 1})</button>
            <button className="btn block" onClick={() => start(true)}>Start over</button>
          </>
        ) : done ? (
          <>
            <button className="btn primary block" onClick={() => start(false)}>Edit my answers</button>
            <button className="btn block" onClick={() => start(true)}>Retake from scratch</button>
          </>
        ) : (
          <button className="btn primary block" onClick={() => start(false)}>Start</button>
        )}
        <Link to="/" className="center">Maybe later</Link>
      </div>
    </div>
  );
}
