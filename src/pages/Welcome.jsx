import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { track } from '../lib/analytics';

// S1: guest is a primary button, never hidden.
export default function Welcome() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const entered = useStore((s) => s.entered);
  const startAuth = useStore((s) => s.startAuth);
  const enterGuest = useStore((s) => s.enterGuest);

  useEffect(() => { track('welcome_view'); }, []);
  if (user) return <Navigate to="/" replace />;

  const go = (method) => { startAuth(method); nav('/auth'); };

  return (
    <div className="onboard stack-lg">
      <div>
        <div className="hero-mark" aria-hidden="true">🧭</div>
        <h1 className="hero-title">See what careers are really like. Then find your way there.</h1>
      </div>
      <div className="stack">
        <button className="btn primary block" onClick={() => go('phone')}>Continue with phone</button>
        <button className="btn block" onClick={() => go('google')}>Continue with Google</button>
        <button className="linkbtn" style={{ display: 'block', margin: '0 auto' }} onClick={() => go('email')}>Use email instead</button>
        <div className="divider">or</div>
        <button className="btn block" onClick={() => { enterGuest(); nav('/'); }}>Explore as guest</button>
        <p className="small muted center">Guests can do everything except sync across devices.</p>
        {entered && <p className="center"><Link to="/">Back to exploring</Link></p>}
      </div>
      <p className="proto-note">Prototype: sign-in is simulated and all data stays on this device. Career figures are illustrative samples.</p>
    </div>
  );
}
