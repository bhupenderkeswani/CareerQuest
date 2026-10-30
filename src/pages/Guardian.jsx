import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { refreshProfile, requestGuardianLink, consentAllowsSync, afterSignIn } from '../lib/account';

// S4: guardian consent for under-18 students (DPDP Act 2023). Never blocks: until the guardian approves, the student
// keeps exploring and their progress stays on this device. The guardian gets a link to approve (no sign-in needed).
export default function Guardian() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const [link, setLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const approved = consentAllowsSync(user);

  // Check for the guardian's approval now and then, and when the student comes back to this tab.
  useEffect(() => {
    if (!user || approved) return undefined;
    const check = () => refreshProfile().catch(() => {});
    const id = setInterval(check, 12000);
    window.addEventListener('focus', check);
    return () => { clearInterval(id); window.removeEventListener('focus', check); };
  }, [user?.id, approved]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/welcome" replace />;

  const getLink = async () => {
    setBusy(true); setError('');
    try { setLink(await requestGuardianLink()); } catch (e) { setError(e.message || 'Could not make a link. Please try again.'); }
    setBusy(false);
  };
  const text = (l) => `Hi! I'm using CareerQuest, a career explorer for students. Because I'm under 18 they need a parent or guardian to say OK before my progress is saved to my account. Could you open this link and approve? ${l}`;
  const share = async () => {
    try { await navigator.share({ title: 'CareerQuest: guardian approval', text: text(link) }); } catch { /* cancelled */ }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError('Could not copy. Press and hold the link to copy it.'); }
  };

  return (
    <div className="onboard stack-lg" style={{ justifyContent: 'flex-start' }}>
      <div className="stack">
        <h1>One quick step</h1>
        <p>Because you’re under 18, a parent or guardian needs to say OK before we save your progress to your account.</p>
      </div>

      {approved ? (
        <div className="card soft stack" role="status">
          <strong>✓ Your guardian said OK</strong>
          <p className="small">Your progress now saves to your account.</p>
          <button className="btn primary block" onClick={() => afterSignIn(user, nav)}>Continue</button>
        </div>
      ) : (
        <>
          {!link ? (
            <div className="stack">
              {user.consent === 'pending' && <div className="card soft" role="status"><strong>⏳ Waiting for your guardian</strong><p className="small">We are checking for their answer. A new link replaces the one you sent before.</p></div>}
              <button className="btn primary block" onClick={getLink} disabled={busy}>{busy ? 'Making your link…' : user.consent === 'pending' ? 'Get a new link' : 'Get a link for my parent or guardian'}</button>
            </div>
          ) : (
            <div className="card soft stack">
              <strong>⏳ Send this to your parent or guardian</strong>
              <input className="field-input" readOnly value={link} aria-label="Link for your guardian" onFocus={(e) => e.target.select()} />
              <div className="row wrap">
                <a className="btn sm primary" href={`https://wa.me/?text=${encodeURIComponent(text(link))}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
                {navigator.share && <button className="btn sm" onClick={share}>Share…</button>}
                <button className="btn sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
              </div>
              <p className="small muted">They open it, read what we collect, and tap approve. This page updates when they do.</p>
            </div>
          )}
          {error && <div className="err" role="alert">{error}</div>}
        </>
      )}

      <div className="card flat">
        <strong>What we collect</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
          <li>Your nickname and class</li>
          <li>Your progress: XP, badges, shortlist, quiz answers</li>
          <li>The email on your Google account, only to sign you in</li>
        </ul>
        <p style={{ marginTop: 8 }}>No ads. No tracking. Your guardian can withdraw consent any time, and that erases your saved progress.</p>
      </div>

      {!approved && (
        <div className="stack">
          <p className="small muted">Meanwhile you can keep exploring. Your progress stays on this device and is saved to your account once your guardian approves.</p>
          <button className="btn block" onClick={() => nav('/')}>Explore for now</button>
        </div>
      )}
    </div>
  );
}
