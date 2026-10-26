import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { CAREER_MAP } from '../data/careers';
import { hasLadder } from '../data/ladders';
import { hasRoadmap } from '../data/roadmaps';
import { ask, getConsent, rerun, removeChip, setConsent, useChat } from '../lib/chat';
import { track } from '../lib/analytics';
import { TopBar } from '../components/TopBar';

const STARTERS = [
  'I’m good at maths and want to earn at least 20 lakh a year',
  'I like helping people but don’t want entrance exams',
  'I’m creative and want to start earning early',
];

const FALLBACK_NOTE = {
  unavailable: 'The assistant could not be reached, so these are quick keyword matches.',
  offline: 'You are offline, so these are quick keyword matches.',
  quota_device: 'You have used today’s assistant questions, so these are quick keyword matches. They reset tomorrow.',
  quota_global: 'The assistant is busy today, so these are quick keyword matches.',
  model_failed: 'The assistant is busy, so these are quick keyword matches.',
  no_model: 'These are quick keyword matches.',
  rules: 'These are quick keyword matches.',
};

function Consent({ onChoose }) {
  return (
    <div className="card soft stack">
      <h2>Before we start</h2>
      <p>You can describe what you want in your own words, like “good at maths, want 20 lakh a year”. We then show roles from CareerQuest that fit, with links.</p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><strong>Assistant mode</strong> sends what you type to an AI service so it can understand you. We remove phone numbers, emails and links first.</li>
        <li><strong>Quick match</strong> works on this device only. Nothing you type leaves it, but it understands fewer phrasings.</li>
      </ul>
      <p className="small muted">Either way: please don’t type your name, school, phone number or family details. Answers are saved without your identity so we can check they are fair.</p>
      <button className="btn primary block" onClick={() => onChoose('ai')}>Use the assistant</button>
      <button className="btn block" onClick={() => onChoose('local')}>Quick match only</button>
    </div>
  );
}

function RoleCard({ hit }) {
  const role = CAREER_MAP[hit.id];
  const inCompare = useStore((s) => s.compare.includes(hit.id));
  const toggleCompare = useStore((s) => s.toggleCompare);
  const pushToast = useStore((s) => s.pushToast);
  if (!role) return null; // content changed under us: never show a role we cannot link to
  const parent = role.parent ? CAREER_MAP[role.parent] : null;
  const r = hit.reach;
  return (
    <article className="card chatcard">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.8rem' }} aria-hidden="true">{role.emoji}</span>
        <div className="grow">
          <h3><Link to={`/career/${role.id}`} onClick={() => track('chat_role_open', { role: role.id })}>{role.name}</Link></h3>
          {parent && <span className="tag brand">Specialisation of {parent.name}</span>}
        </div>
      </div>
      <p style={{ marginTop: 8 }}>{hit.why}</p>
      <dl className="paylines">
        <dt>Starts at</dt><dd>{hit.entry_pay}</dd>
        {r && !r.atStart && (
          <>
            <dt>{r.kind === 'typical' ? 'Reaches' : 'Can reach'}</dt>
            <dd><strong>{r.pay}</strong> as {r.title}<span className="muted"> · {r.when}{r.track ? ` · ${r.track.toLowerCase()}` : ''}</span></dd>
          </>
        )}
      </dl>
      <p className="small muted"><strong>Worth checking:</strong> {hit.check}</p>
      <div className="row wrap" style={{ marginTop: 10 }}>
        <Link className="btn sm primary" to={`/career/${role.id}`} onClick={() => track('chat_role_open', { role: role.id })}>Open card</Link>
        {hasLadder(role.id) && <Link className="btn sm" to={`/career/${role.id}/ladder`}>Career ladder</Link>}
        {hasRoadmap(role.id) && <Link className="btn sm" to={`/roadmap/${role.id}`}>Roadmap</Link>}
        <button className="btn sm" aria-pressed={inCompare} onClick={() => { if (!toggleCompare(role.id)) pushToast('You can compare up to 3 careers.', 'info'); }}>{inCompare ? '✓ In Compare' : '+ Compare'}</button>
      </div>
    </article>
  );
}

function BotMessage({ msg, latest, last, onChip, onMore }) {
  return (
    <div className="bubble bot stack" role="group" aria-label="Assistant" data-last={last}>
      <p>{msg.reply.intro}</p>
      {msg.fallback && FALLBACK_NOTE[msg.fallback] && <p className="small muted" role="status">{FALLBACK_NOTE[msg.fallback]}</p>}
      {latest && msg.chips.length > 0 && (
        <div>
          <div className="small muted" style={{ marginBottom: 4 }}>Understood (tap ✕ to change):</div>
          <div className="row wrap" style={{ gap: 6 }}>
            {msg.chips.map((c) => (
              <span key={c.id} className="chip on" style={{ padding: '4px 6px 4px 12px' }}>
                {c.label}
                <button className="chipx" aria-label={`Remove: ${c.label}`} onClick={() => onChip(c.id)}>✕</button>
              </span>
            ))}
          </div>
        </div>
      )}
      {msg.hits.map((h) => <RoleCard key={h.id} hit={h} />)}
      {latest && msg.total > msg.hits.length && <button className="linkbtn" onClick={onMore}>Show more matches ({msg.total - msg.hits.length} more)</button>}
      {msg.filters.min_salary_lpa != null && msg.hits.length > 0 && (
        <p className="small muted">Pay figures are typical ranges from our data, not promises. Study time, exams and what you enjoy matter too. Roles are ordered by how well they fit you, not by pay.</p>
      )}
      {msg.reply.follow_up && <p><strong>{msg.reply.follow_up}</strong></p>}
    </div>
  );
}

// Role finder: describe what you want, get roles from the curated data with links.
export default function Chat() {
  const [consent, setConsentState] = useState(getConsent);
  const messages = useChat((s) => s.messages);
  const push = useChat((s) => s.push);
  const clearChat = useChat((s) => s.clear);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { track('chat_open'); }, []);
  // Land at the top of the newest message (a long answer should not scroll its own start out of view).
  useEffect(() => {
    if (messages.length === 0 && !busy) return;
    document.querySelector('.chatpage [data-last="true"]')?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }, [messages, busy]);

  const lastBot = [...messages].reverse().find((m) => m.role === 'bot');
  const choose = (v) => { setConsent(v); setConsentState(v); track('chat_consent', { mode: v }); };

  const send = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    setInput('');
    push({ role: 'user', text: message });
    setBusy(true);
    const res = await ask({ message, prior: lastBot?.filters || null, lastQuestion: lastBot?.reply.follow_up, consent });
    setBusy(false);
    push({ role: 'bot', ...res });
    track('chat_message', { ai: res.meta?.source === 'model', salary_filter: res.filters.min_salary_lpa != null, hits: res.hits.length });
    if (res.fallback) track('chat_fallback', { reason: res.fallback });
  };

  // Chips and "show more" re-run retrieval on the device: instant, free, and consistent with what is on screen.
  const update = (filters, limit) => {
    const res = rerun(filters, limit);
    res.reply = { ...res.reply, intro: limit > 5 ? 'Here are more matches.' : 'Updated for your changes.' };
    push({ role: 'bot', ...res, fallback: null });
  };
  const onChip = (id) => { track('chat_chip_removed', { chip: id.split(':')[0] }); update(removeChip(lastBot.filters, id)); };
  const onMore = () => update(lastBot.filters, 12);

  return (
    <div className="stack chatpage">
      <TopBar title="Role finder" backTo="/foryou">
        {consent && (
          <button className="linkbtn small" onClick={() => choose(consent === 'ai' ? 'local' : 'ai')} aria-label="Change privacy mode">
            {consent === 'ai' ? 'Assistant mode' : 'Quick match only'} · change
          </button>
        )}
      </TopBar>

      {!consent ? <Consent onChoose={choose} /> : (
        <>
          <div className="bubble bot stack">
            <p>Tell me what you’re looking for in your own words: subjects you like, pay you’re aiming for, how long you’re happy to study. I’ll suggest roles from CareerQuest.</p>
            {messages.length === 0 && (
              <div className="stack" style={{ gap: 8 }}>
                {STARTERS.map((s) => <button key={s} className="chip starter" onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
          </div>

          {messages.map((m, i) => (m.role === 'user'
            ? <div key={i} className="bubble user" data-last={!busy && i === messages.length - 1}>{m.text}</div>
            : <BotMessage key={i} msg={m} latest={m === lastBot} last={!busy && i === messages.length - 1} onChip={onChip} onMore={onMore} />))}
          {busy && <div className="bubble bot" role="status" aria-label="Thinking" data-last="true"><span className="dots"><i /><i /><i /></span></div>}

          <form className="chatbar card" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <label htmlFor="chat-input" className="sr-only">Describe what you want</label>
            <textarea id="chat-input" className="field-input" rows={1} maxLength={500} value={input} placeholder="For example: good at maths, want 20 lakh a year"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }} />
            <div className="row spread">
              <span className="small muted">Please don’t share your name, phone or school.</span>
              <button className="btn primary sm" type="submit" disabled={busy || !input.trim()}>Send</button>
            </div>
          </form>
          {messages.length > 0 && <button className="linkbtn" style={{ alignSelf: 'center' }} onClick={clearChat}>Clear conversation</button>}
          <p className="proto-note">Suggestions use only the careers on CareerQuest. Prototype data: illustrative samples.</p>
        </>
      )}
    </div>
  );
}
