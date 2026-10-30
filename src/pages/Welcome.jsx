import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { isConfigured } from '../lib/supabase';
import { signInWithGoogle } from '../lib/account';
import { track } from '../lib/analytics';

// The standard multicolour Google "G" (Google's branding rules ask for it on sign-in buttons).
function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

// S1: guest is a primary button, never hidden. Google is the only way to make an account.
export default function Welcome() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const entered = useStore((s) => s.entered);
  const enterGuest = useStore((s) => s.enterGuest);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { track('welcome_view'); }, []);
  if (user) return <Navigate to="/" replace />;

  const google = async () => {
    setBusy(true); setError('');
    const res = await signInWithGoogle(); // leaves for Google; only returns here on an error
    if (res?.error) { setError(res.error); setBusy(false); }
  };

  return (
    <div className="onboard stack-lg">
      <div>
        <div className="hero-mark" aria-hidden="true">🧭</div>
        <h1 className="hero-title">See what careers are really like. Then find your way there.</h1>
      </div>
      <div className="stack">
        {isConfigured && (
          <>
            <button className="btn primary block" onClick={google} disabled={busy}><GoogleG /> {busy ? 'Opening Google…' : 'Continue with Google'}</button>
            {error && <div className="err center" role="alert">{error}</div>}
            <div className="divider">or</div>
          </>
        )}
        <button className="btn block" onClick={() => { enterGuest(); nav('/'); }}>Explore as guest</button>
        <p className="small muted center">
          {isConfigured
            ? 'An account saves your progress across devices. Guests can do everything except that.'
            : 'Guests can do everything. Accounts need the server connection, which is not set up in this build.'}
        </p>
        {isConfigured && <p className="small muted center">Under 18? You can sign in too. A parent or guardian just needs to say OK before your progress is saved to the account.</p>}
        {entered && <p className="center"><Link to="/">Back to exploring</Link></p>}
      </div>
      <p className="proto-note">Prototype: entry salaries and exams are checked against public sources; other figures are estimates.</p>
    </div>
  );
}
