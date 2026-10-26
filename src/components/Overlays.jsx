import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, useRole } from '../store';
import { Sheet } from './Sheet';
import { BADGE_MAP, badgeProgress } from '../lib/badges';
import { LEVELS, DAILY_CAP } from '../lib/config';
import { fmtDate, isStale } from '../lib/freshness';
import { syncReports } from '../lib/reports';

function Toast({ t }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const id = setTimeout(() => dismiss(t.id), t.kind === 'info' ? 3500 : 2200);
    return () => clearTimeout(id);
  }, [t.id, t.kind, dismiss]);
  return <div className={`toast ${t.kind}`}>{t.text}</div>;
}

// Quiet note when the daily cap is reached: no penalty language, no streaks.
function CapNote() {
  const dismiss = useStore((s) => s.dismissCapNote);
  useEffect(() => {
    const id = setTimeout(dismiss, 5000);
    return () => clearTimeout(id);
  }, [dismiss]);
  return (
    <div className="toast note" role="status" onClick={dismiss}>
      You’ve maxed today’s XP ({DAILY_CAP}). Keep exploring, it resets tomorrow.
    </div>
  );
}

function BadgeUnlock({ id }) {
  const popBadge = useStore((s) => s.popBadge);
  const b = BADGE_MAP[id];
  const queued = useStore((s) => s.ui.badgeQueue.length);
  return (
    <Sheet onClose={popBadge} label="Badge unlocked">
      <div className="center stack">
        <div className="bigicon" aria-hidden="true">{b.icon}</div>
        <div className="small muted">Badge unlocked</div>
        <h2>{b.name}</h2>
        <p className="muted">{b.rule}</p>
        <button className="btn primary block" onClick={popBadge}>{queued > 1 ? 'Next' : 'Nice!'}</button>
      </div>
    </Sheet>
  );
}

function LevelUp({ n }) {
  const dismiss = useStore((s) => s.dismissLevelUp);
  const opened = useStore((s) => s.stats.opened.length);
  const xp = useStore((s) => s.xp);
  const lvl = LEVELS.find((l) => l.n === n);
  return (
    <Sheet modal onClose={dismiss} label="Level up">
      <div className="stack">
        <div className="bigicon" aria-hidden="true">🎉</div>
        <h2>Level {lvl.n}: {lvl.name}</h2>
        <p className="muted">You’ve explored {opened} role{opened === 1 ? '' : 's'} and earned {xp} XP.</p>
        <button className="btn primary block" onClick={dismiss}>Keep exploring</button>
      </div>
    </Sheet>
  );
}

const PROMPTS = {
  badge: ['Save your badge.', 'Create an account so it stays with you.'],
  quiz: ['Save your picks across devices.', 'Create an account to keep your quiz results.'],
  shortlist: ['Don’t lose your shortlist.', 'Create an account to keep it safe.'],
};

function GuestPrompt({ kind }) {
  const dismiss = useStore((s) => s.dismissGuestPrompt);
  const nav = useNavigate();
  const [title, body] = PROMPTS[kind];
  return (
    <div className="guest-prompt" role="status">
      <div className="row">
        <div className="grow">
          <strong>{title}</strong>
          <div className="small muted">{body}</div>
        </div>
        <button className="btn primary sm" onClick={() => { dismiss(); nav('/welcome'); }}>Sign up</button>
        <button className="iconbtn" aria-label="Dismiss" onClick={dismiss}>✕</button>
      </div>
    </div>
  );
}

// S21: source, last updated, status and change history for one field.
function InfoSheet({ info }) {
  const close = useStore((s) => s.closeInfo);
  const openReport = useStore((s) => s.openReport);
  const role = useRole(info.roleId);
  const [showHistory, setShowHistory] = useState(false);
  const fld = info.fieldKey ? role.fields[info.fieldKey] : info.custom;
  const stale = isStale(fld.updated);
  const history = info.fieldKey ? role.changeLog.filter((c) => c.field === info.fieldKey) : [];
  const label = fld.label || fld.title;
  return (
    <Sheet onClose={close} label={`${label}: source and freshness`}>
      <div className="stack">
        <h2>{label}</h2>
        <div className="card flat">
          <div className="small muted">Value</div>
          <div><strong>{fld.value}</strong></div>
          <div className="small muted" style={{ marginTop: 10 }}>Source</div>
          <div>{fld.source}</div>
          <div className="small muted" style={{ marginTop: 10 }}>Last updated</div>
          <div>{fmtDate(fld.updated)}</div>
          <div className="small muted" style={{ marginTop: 10 }}>Status</div>
          <div>{stale ? <span className="tag warn">⚠ May be outdated (over 90 days)</span> : <span className="tag good">✓ Current</span>}</div>
        </div>
        {info.fieldKey && (
          <div>
            <button className="linkbtn" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
              {showHistory ? 'Hide change history' : 'View change history'}
            </button>
            {showHistory && (
              <ul className="list" style={{ marginTop: 8 }}>
                {history.length === 0 && <li className="small muted" style={{ padding: '8px 0' }}>No changes recorded since this field was added.</li>}
                {history.map((h, i) => (
                  <li key={i} className="small" style={{ padding: '8px 0' }}>
                    <strong>{fmtDate(h.date)}</strong>: {h.from} → {h.to}
                    <div className="muted">Source: {h.source}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button className="btn block" onClick={() => openReport({ roleId: info.roleId, field: label })}>Report an error</button>
      </div>
    </Sheet>
  );
}

// S22: report a data error. Feeds the same review queue as the daily refresh.
function ReportSheet({ report }) {
  const close = useStore((s) => s.closeReport);
  const submit = useStore((s) => s.submitReport);
  const role = useRole(report.roleId);
  const labels = [...new Set([...Object.values(role.fields).map((f) => f.label), report.field, 'Something else'].filter(Boolean))];
  const [field, setField] = useState(report.field || labels[0]);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Sheet onClose={close} label="Report sent">
        <div className="center stack">
          <div className="bigicon" aria-hidden="true">🙏</div>
          <h2>Thanks, we’ll check it</h2>
          <p className="muted">A reviewer will look at this. If it’s accepted you’ll get a notification and the Fact Checker badge.</p>
          <button className="btn primary block" onClick={close}>Done</button>
        </div>
      </Sheet>
    );
  }
  return (
    <Sheet onClose={close} label="Report an error">
      <form
        className="stack"
        onSubmit={(e) => { e.preventDefault(); if (text.trim().length < 5) return; submit({ roleId: report.roleId, field, text: text.trim() }); setDone(true); syncReports(); }}
      >
        <h2>Report an error on {role.name}</h2>
        <div>
          <label className="lbl" htmlFor="rp-field">Which number looks wrong?</label>
          <select id="rp-field" className="field-input" value={field} onChange={(e) => setField(e.target.value)}>
            {labels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl" htmlFor="rp-text">What should it say, and how do you know?</label>
          <textarea id="rp-text" className="field-input" value={text} onChange={(e) => setText(e.target.value)} required minLength={5} placeholder="For example: the exam changed this year, see the official notice." />
        </div>
        <button className="btn primary block" type="submit" disabled={text.trim().length < 5}>Send report</button>
      </form>
    </Sheet>
  );
}

export function BadgeDetail({ id, onClose }) {
  const state = useStore();
  const b = BADGE_MAP[id];
  const unlockedAt = state.badges[id];
  const p = badgeProgress(b, state);
  return (
    <Sheet onClose={onClose} label={b.name}>
      <div className="center stack">
        <div className="bigicon" aria-hidden="true" style={unlockedAt ? undefined : { filter: 'grayscale(1)', opacity: 0.5 }}>{b.icon}</div>
        <h2>{b.name}</h2>
        <p>Unlock: {b.rule}.</p>
        {unlockedAt ? (
          <span className="tag good" style={{ alignSelf: 'center' }}>✓ Unlocked {fmtDate(new Date(unlockedAt).toISOString())}</span>
        ) : (
          <>
            <div>
              <div className="small muted">Progress: {p.cur} of {p.target}</div>
              <div className="progress" style={{ marginTop: 6 }}><i style={{ width: `${p.pct}%` }} /></div>
            </div>
            <p className="muted">Hint: {b.hint(state)}</p>
          </>
        )}
        <button className="btn block" onClick={onClose}>Close</button>
      </div>
    </Sheet>
  );
}

export function Overlays() {
  const ui = useStore((s) => s.ui);
  return (
    <>
      <div className="toast-wrap" aria-live="polite">
        {ui.toasts.map((t) => <Toast key={t.id} t={t} />)}
        {ui.capNote && <CapNote />}
      </div>
      {ui.guestPrompt && <GuestPrompt kind={ui.guestPrompt} />}
      {ui.info && <InfoSheet info={ui.info} />}
      {ui.report && <ReportSheet report={ui.report} />}
      {ui.badgeQueue[0] && <BadgeUnlock id={ui.badgeQueue[0]} />}
      {!ui.badgeQueue[0] && ui.levelUp && <LevelUp n={ui.levelUp} />}
    </>
  );
}
