import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CLASS_STAGES } from '../lib/config';
import { afterSignIn, createProfile, useAuth } from '../lib/account';
import { TopBar } from '../components/TopBar';

export const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

// S3: minimum data only. Under 18 follows from the class; for "Other" a date of birth decides, and the date is not kept.
export default function AboutYou() {
  const nav = useNavigate();
  const status = useAuth((s) => s.status);
  const [nickname, setNickname] = useState('');
  const [classStage, setClassStage] = useState('c11');
  const [state, setState] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'out') return <Navigate to="/welcome" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (nickname.trim().length < 2) return setError('Pick a nickname with at least 2 letters.');
    if (classStage === 'other' && !dob) return setError('Add your date of birth so we know which sign-up steps apply. We do not keep it.');
    setBusy(true); setError('');
    try {
      const user = await createProfile({ nickname, classStage, state, dob });
      await afterSignIn(user, nav);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="onboard stack-lg" style={{ justifyContent: 'flex-start' }}>
      <TopBar title="A bit about you" backTo="/welcome" />
      <form className="stack-lg" onSubmit={submit}>
        <div>
          <label className="lbl" htmlFor="nick">Nickname</label>
          <input id="nick" className="field-input" maxLength={20} autoComplete="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="What should we call you?" />
          <p className="small muted" style={{ marginTop: 6 }}>No need to use your real name. We never show your Google name or email.</p>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="lbl">I’m in</legend>
          {CLASS_STAGES.map((c) => (
            <button type="button" key={c.id} role="radio" aria-checked={classStage === c.id} className="radio" onClick={() => setClassStage(c.id)}>
              <span className="dot">{classStage === c.id ? '•' : ''}</span>{c.label}
            </button>
          ))}
        </fieldset>
        {classStage === 'other' && (
          <div>
            <label className="lbl" htmlFor="dob">Date of birth</label>
            <input id="dob" type="date" className="field-input" max={new Date().toISOString().slice(0, 10)} value={dob} onChange={(e) => setDob(e.target.value)} />
            <p className="small muted" style={{ marginTop: 6 }}>Used once to check whether you are under 18. It is not saved.</p>
          </div>
        )}
        <div>
          <label className="lbl" htmlFor="state">State <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
          <select id="state" className="field-input" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Prefer not to say</option>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn primary block" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Continue'}</button>
      </form>
    </div>
  );
}
