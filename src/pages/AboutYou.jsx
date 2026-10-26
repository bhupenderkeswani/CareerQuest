import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { CLASS_STAGES } from '../lib/config';
import { TopBar } from '../components/TopBar';

export const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

// Where to go once the profile (and any guardian step) is done.
export function afterProfile(nav) {
  const s = useStore.getState();
  if (s.hasGuestData()) return nav('/merge', { replace: true });
  return nav(s.quiz.completedAt ? '/' : '/quiz', { replace: true });
}

// S3: minimum data only. Under-18 is inferred from class, with a date of birth for "Other".
export default function AboutYou() {
  const nav = useNavigate();
  const method = useStore((s) => s.pendingAuth);
  const createUser = useStore((s) => s.createUser);
  const [nickname, setNickname] = useState('');
  const [classStage, setClassStage] = useState('c11');
  const [state, setState] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  if (!method) return <Navigate to="/welcome" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (nickname.trim().length < 2) return setError('Pick a nickname with at least 2 letters.');
    if (classStage === 'other' && !dob) return setError('Add your date of birth so we know which sign-up steps apply.');
    const minor = createUser({ nickname, classStage, state, dob });
    if (minor) nav('/guardian', { replace: true });
    else afterProfile(nav);
  };

  return (
    <div className="onboard stack-lg" style={{ justifyContent: 'flex-start' }}>
      <TopBar title="A bit about you" backTo="/auth" />
      <form className="stack-lg" onSubmit={submit}>
        <div>
          <label className="lbl" htmlFor="nick">Nickname</label>
          <input id="nick" className="field-input" maxLength={20} autoComplete="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="What should we call you?" />
          <p className="small muted" style={{ marginTop: 6 }}>No need to use your real name.</p>
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
        <button className="btn primary block" type="submit">Continue</button>
      </form>
    </div>
  );
}
