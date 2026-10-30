import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { approveConsent, consentPreview, withdrawConsent } from '../lib/account';
import { CLASS_STAGES } from '../lib/config';

// What a parent or guardian sees when they open the link. They do not need an account: the link is the credential.
export default function ConsentApprove() {
  const { token } = useParams();
  const [info, setInfo] = useState(undefined); // undefined = loading, null = invalid or expired
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(null); // 'approved' | 'withdrawn'
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setInfo(undefined); setDone(null); setError(''); setName(''); setAgree(false); // a new link starts clean
    consentPreview(token).then(setInfo).catch(() => setInfo(null));
  }, [token]);

  const stage = info && CLASS_STAGES.find((c) => c.id === info.class_stage)?.label;
  const approve = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const ok = await approveConsent(token, name);
      if (ok) setDone('approved'); else setError('This link is no longer valid. Ask your child for a new one.');
    } catch (err) { setError(err.message || 'Something went wrong. Please try again.'); }
    setBusy(false);
  };
  const withdraw = async () => {
    setBusy(true); setError('');
    try { if (await withdrawConsent(token)) setDone('withdrawn'); else setError('This link is no longer valid.'); } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="onboard stack-lg" style={{ justifyContent: 'flex-start' }}>
      <div><div className="hero-mark" aria-hidden="true" style={{ textAlign: 'left' }}>🧭</div><h1>CareerQuest: guardian approval</h1></div>

      {info === undefined && <p className="muted" role="status">Checking your link…</p>}
      {info === null && !done && (
        <div className="card soft stack" role="alert"><strong>This link is not valid</strong><p className="small">It may have expired (links last 14 days), been replaced by a newer one, or been used already. Ask your child to make a new link.</p></div>
      )}

      {done === 'approved' && <div className="card soft stack" role="status"><strong>✓ Thank you. You have approved.</strong><p className="small">Your child’s progress will now be saved to their account. You can withdraw consent any time by opening this same link again.</p></div>}
      {done === 'withdrawn' && <div className="card soft stack" role="status"><strong>Consent withdrawn</strong><p className="small">Your child’s saved progress has been erased from their account. They can still explore as before, and can ask you for a new link.</p></div>}

      {info && !done && info.status === 'pending' && (
        <form className="stack-lg" onSubmit={approve}>
          <p><strong>{info.nickname}</strong> ({stage}) wants to save their progress on CareerQuest and needs a parent or guardian to say OK because they are under 18.</p>
          <div className="card flat stack">
            <strong>About CareerQuest</strong>
            <p className="small">A free tool that shows students what careers are really like: roles, study paths, exams and typical pay, so they can explore and compare. There are no ads, and nothing is sold.</p>
            <strong>What we save for {info.nickname}</strong>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Their nickname and class</li>
              <li>Their progress: points, badges, saved careers, quiz answers, roadmap steps</li>
              <li>The email of the Google account they sign in with, only to sign them in</li>
            </ul>
            <strong>Your rights</strong>
            <p className="small">You can withdraw consent at any time using this link, which erases their saved progress. They, or you, can delete the account from Settings.</p>
          </div>
          <div>
            <label className="lbl" htmlFor="gname">Your name</label>
            <input id="gname" className="field-input" maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <label className="row" style={{ alignItems: 'flex-start' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2 }} />
            <span>I am {info.nickname}’s parent or legal guardian, and I agree to the above.</span>
          </label>
          {error && <div className="err" role="alert">{error}</div>}
          <button className="btn primary block" type="submit" disabled={busy || !agree || name.trim().length < 2}>{busy ? 'Saving…' : 'Approve'}</button>
        </form>
      )}

      {info && !done && info.status === 'approved' && (
        <div className="stack">
          <div className="card soft"><strong>✓ You have already approved for {info.nickname}.</strong></div>
          <p className="small muted">If you change your mind, you can withdraw consent. That erases their saved progress.</p>
          {error && <div className="err" role="alert">{error}</div>}
          <button className="btn danger block" onClick={withdraw} disabled={busy}>{busy ? 'Working…' : 'Withdraw consent'}</button>
        </div>
      )}
      <p className="proto-note">CareerQuest prototype</p>
    </div>
  );
}
