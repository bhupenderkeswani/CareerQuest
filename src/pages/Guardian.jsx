import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { afterProfile } from './AboutYou';

// S4: guardian consent for under-18 users (DPDP Act 2023). Never blocks sign-up: until the
// guardian approves, the student keeps guest-level features with progress saved on this device.
export default function Guardian() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const send = useStore((s) => s.sendGuardianLink);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/welcome" replace />;
  const sent = user.consent === 'pending';

  const onSend = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a 10-digit mobile number.');
    setError('');
    send(phone);
  };

  return (
    <div className="onboard stack-lg" style={{ justifyContent: 'flex-start' }}>
      <div className="stack">
        <h1>One quick step</h1>
        <p>Because you’re under 18, a parent or guardian needs to say OK.</p>
      </div>

      {!sent ? (
        <form className="stack" onSubmit={onSend}>
          <div>
            <label className="lbl" htmlFor="gphone">Guardian’s phone</label>
            <div className="row">
              <span className="field-input" style={{ width: 72, display: 'grid', placeItems: 'center' }}>+91</span>
              <input id="gphone" className="field-input" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
            </div>
            {error && <div className="err" role="alert">{error}</div>}
          </div>
          <button className="btn primary block" type="submit">Send them a link</button>
        </form>
      ) : (
        <div className="card soft stack" role="status">
          <strong>⏳ Waiting for guardian</strong>
          <p className="small">We sent a link to {user.guardianHint}. You can check the status any time on the Me tab.</p>
        </div>
      )}

      <div className="card flat">
        <strong>What we collect</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
          <li>Your nickname and class</li>
          <li>Your progress</li>
        </ul>
        <p style={{ marginTop: 8 }}>No ads. No tracking.</p>
      </div>

      <div className="stack">
        <p className="small muted">Meanwhile you can keep exploring as a guest. Your progress stays on this device and moves to your account once approved.</p>
        <button className="btn block" onClick={() => afterProfile(nav)}>Explore for now</button>
      </div>
    </div>
  );
}
