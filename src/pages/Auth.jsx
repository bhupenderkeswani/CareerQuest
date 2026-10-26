import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';

function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, ' ').split('');
  const set = (i, ch) => {
    const d = ch.replace(/\D/g, '');
    if (!d) return;
    const next = (value.slice(0, i) + d[0] + value.slice(i + 1)).slice(0, 6);
    onChange(next);
    refs.current[Math.min(i + 1, 5)]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(value.slice(0, i > 0 && !digits[i].trim() ? i - 1 : i) + value.slice(i + 1));
      refs.current[Math.max(i - 1, 0)]?.focus();
    }
  };
  const onPaste = (e) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (d) { e.preventDefault(); onChange(d); refs.current[Math.min(d.length, 5)]?.focus(); }
  };
  return (
    <div className="otp" onPaste={onPaste}>
      {digits.map((ch, i) => (
        <input
          key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1} value={ch.trim()} aria-label={`Digit ${i + 1} of 6`}
          onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
        />
      ))}
    </div>
  );
}

// S2: phone OTP is primary (suited to India); Google and email are alternatives.
// All three are simulated in the prototype: any 6-digit code works.
export default function Auth() {
  const nav = useNavigate();
  const method = useStore((s) => s.pendingAuth);
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  if (!method) return <Navigate to="/welcome" replace />;

  const valid = method === 'phone' ? /^[6-9]\d{9}$/.test(contact) : /^\S+@\S+\.\S+$/.test(contact);
  const send = () => {
    if (!valid) { setError(method === 'phone' ? 'Enter a 10-digit mobile number.' : 'Enter a valid email address.'); return; }
    setError(''); setSent(true); setWait(28); setCode('');
  };
  const verify = () => {
    if (code.length !== 6) { setError('Enter the 6-digit code.'); return; }
    nav('/about');
  };

  return (
    <div className="onboard stack-lg" style={{ justifyContent: 'flex-start' }}>
      <TopBar title={method === 'google' ? 'Continue with Google' : 'Log in'} backTo="/welcome" />

      {method === 'google' && (
        <div className="stack">
          <div className="card flat row">
            <span style={{ fontSize: '1.6rem' }} aria-hidden="true">👤</span>
            <div className="grow"><strong>Demo Google account</strong><div className="small muted">Simulated for the prototype</div></div>
          </div>
          <button className="btn primary block" onClick={() => nav('/about')}>Continue</button>
        </div>
      )}

      {method !== 'google' && !sent && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <div>
            <label className="lbl" htmlFor="contact">{method === 'phone' ? 'Your mobile number' : 'Your email'}</label>
            {method === 'phone' ? (
              <div className="row">
                <span className="field-input" style={{ width: 72, display: 'grid', placeItems: 'center' }}>+91</span>
                <input id="contact" className="field-input" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit number" value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))} />
              </div>
            ) : (
              <input id="contact" className="field-input" type="email" autoComplete="email" placeholder="you@example.com" value={contact} onChange={(e) => setContact(e.target.value)} />
            )}
            {error && <div className="err" role="alert">{error}</div>}
          </div>
          <button className="btn primary block" type="submit">{method === 'phone' ? 'Send OTP' : 'Send code'}</button>
          <p className="small muted">We only use this to log you in.</p>
        </form>
      )}

      {method !== 'google' && sent && (
        <div className="stack">
          <div>
            <h2>Enter the 6-digit code</h2>
            <p className="small muted">Sent to {method === 'phone' ? `+91 ${contact}` : contact}. Prototype: any 6 digits work.</p>
          </div>
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(''); }} />
          {error && <div className="err center" role="alert">{error}</div>}
          <button className="btn primary block" onClick={verify}>Verify</button>
          <p className="center small muted">
            {wait > 0 ? `Resend in 0:${String(wait).padStart(2, '0')}` : <button className="linkbtn" onClick={send}>Resend code</button>}
          </p>
          <button className="linkbtn" onClick={() => { setSent(false); setCode(''); }}>Change {method === 'phone' ? 'number' : 'email'}</button>
        </div>
      )}
    </div>
  );
}
