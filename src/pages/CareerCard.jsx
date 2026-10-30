import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore, useRole, useRoles, useOnline } from '../store';
import { CAREER_MAP, CHILDREN, FIELD_KEYS } from '../data/careers';
import { hasRoadmap } from '../data/roadmaps';
import { hasLadder, ladderChain } from '../data/ladders';
import { FIELDS } from '../lib/config';
import { shareCard } from '../lib/share';
import { FieldRow } from '../components/FieldRow';
import { TopBar } from '../components/TopBar';

function Accordion({ title, count, open, onToggle, children }) {
  return (
    <div className="accordion card" data-open={open}>
      <button aria-expanded={open} onClick={onToggle}>
        <span>{title}{count != null && ` (${count})`}</span>
        <span className="chev" aria-hidden="true">▾</span>
      </button>
      {open && <div style={{ paddingBottom: 6 }}>{children}</div>}
    </div>
  );
}

// A linked list of related roles: specialisations of this one, or siblings of a specialisation.
function RoleLinks({ roles }) {
  return (
    <ul className="list">
      {roles.map((r) => (
        <li key={r.id}>
          <Link className="listbtn" to={`/career/${r.id}`}>
            <span className="row" style={{ alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{r.emoji}</span>
              <span>
                <strong>{r.name}</strong>
                <span className="small muted" style={{ display: 'block' }}>{r.fields.salary.label}: {r.fields.salary.value}</span>
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SideQuest({ roleId, sq }) {
  const target = CAREER_MAP[sq.to];
  const viewSideQuest = useStore((s) => s.viewSideQuest);
  const [open, setOpen] = useState(false);
  return (
    <div className="sq">
      <button className="row" style={{ width: '100%', background: 'none', border: 0, padding: 0, textAlign: 'left' }} aria-expanded={open}
        onClick={() => { if (!open) viewSideQuest(roleId, sq.to); setOpen((v) => !v); }}>
        <span style={{ fontSize: '1.6rem' }} aria-hidden="true">{target.emoji}</span>
        <span className="grow"><strong>{target.name}</strong><span className="small muted" style={{ display: 'block' }}>{target.tagline}</span></span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10 }} className="stack">
          <div><span className="tag brand">Carries over</span> <span>{sq.carries}</span></div>
          <Link className="btn sm" to={`/career/${sq.to}`}>Open {target.name} card</Link>
        </div>
      )}
    </div>
  );
}

// S7: career card with per-field freshness, Daily Quest, Side Quests and the roadmap CTA.
export default function CareerCard() {
  const { id } = useParams();
  const nav = useNavigate();
  const role = useRole(id);
  const online = useOnline();
  const openCard = useStore((s) => s.openCard);
  const shortlisted = useStore((s) => s.shortlist.includes(id));
  const toggleShortlist = useStore((s) => s.toggleShortlist);
  const inCompare = useStore((s) => s.compare.includes(id));
  const toggleCompare = useStore((s) => s.toggleCompare);
  const expandDailyQuest = useStore((s) => s.expandDailyQuest);
  const recordShare = useStore((s) => s.recordShare);
  const learned = useStore((s) => s.learnedFor[id]);
  const answerLearned = useStore((s) => s.answerLearned);
  const openReport = useStore((s) => s.openReport);
  const pushToast = useStore((s) => s.pushToast);
  const notifOn = useStore((s) => s.notif.roleUpdates);
  const [dq, setDq] = useState(false);
  const [sq, setSq] = useState(false);
  const parent = role?.parent ? CAREER_MAP[role.parent] : null;
  const kids = useRoles((CHILDREN[id] || []).map((c) => c.id));
  const siblings = useRoles(parent ? CHILDREN[parent.id].filter((c) => c.id !== id).map((c) => c.id) : []);

  useEffect(() => { if (role) openCard(id); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setDq(false); setSq(false); }, [id]);

  if (!role) {
    return (
      <div className="stack">
        <TopBar title="Career not found" backTo="/" />
        <p className="muted">We couldn’t find that career. <Link to="/">Back to Explore</Link></p>
      </div>
    );
  }

  const onShare = async () => {
    if (!online) return pushToast('Sharing needs a connection.', 'info');
    try {
      const result = await shareCard(role);
      if (result !== 'cancelled') {
        recordShare(id);
        if (result === 'downloaded') pushToast('Card image saved. Send it on WhatsApp.', 'info');
      }
    } catch {
      pushToast('Couldn’t make the image. Try again.', 'info');
    }
  };
  const onCompare = () => { if (!toggleCompare(id)) pushToast('You can compare up to 3 careers.', 'info'); };

  return (
    <div className="stack">
      <TopBar title={role.name} backTo="/">
        <button className="iconbtn" aria-label={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'} aria-pressed={shortlisted} onClick={() => toggleShortlist(id)}>{shortlisted ? '♥' : '♡'}</button>
        <button className="iconbtn" aria-label="Share this card as an image" onClick={onShare}>⤴</button>
      </TopBar>

      <div className="illus" style={{ background: `linear-gradient(135deg, hsl(${role.hue} 80% 88%), hsl(${(role.hue + 35) % 360} 75% 80%))` }} aria-hidden="true">{role.emoji}</div>
      <div>
        <div className="row wrap" style={{ gap: 8 }}>
          <span className={`tag field-${role.field}`} style={{ color: 'var(--fc)' }}>{FIELDS[role.field].emoji} {FIELDS[role.field].label}</span>
          {parent && <Link className="tag brand" to={`/career/${parent.id}`} style={{ textDecoration: 'none' }}>↑ Specialisation of {parent.name}</Link>}
        </div>
        <p style={{ marginTop: 6, fontSize: '1.05rem' }}>{role.tagline}</p>
      </div>

      <div className="card">
        {FIELD_KEYS.map((k) => <FieldRow key={k} role={role} k={k} />)}
      </div>

      {kids.length > 0 && (
        <section className="card" aria-labelledby="specs">
          <h2 id="specs">Specialisations ({kids.length})</h2>
          <p className="small muted" style={{ margin: '4px 0 6px' }}>Inside {role.name} you can go deeper. Each has its own pay, study path and exams.</p>
          <RoleLinks roles={kids} />
        </section>
      )}

      <Accordion title="Daily Quest: a day in this job" open={dq} onToggle={() => { if (!dq) expandDailyQuest(id); setDq((v) => !v); }}>
        <ul className="timeline">
          {role.dailyQuest.map(([t, text]) => (
            <li key={t}><span className="t">{t}</span><span>{text}</span></li>
          ))}
        </ul>
        <p className="small muted"><strong>Worth checking:</strong> {role.check}</p>
      </Accordion>

      <Accordion title="Side Quests: if you change your mind" count={role.sideQuests.length} open={sq} onToggle={() => setSq((v) => !v)}>
        {role.sideQuests.map((s) => <SideQuest key={s.to} roleId={id} sq={s} />)}
      </Accordion>

      {siblings.length > 0 && (
        <section className="card" aria-labelledby="sibs">
          <h2 id="sibs">Other specialisations in {parent.name}</h2>
          <RoleLinks roles={siblings} />
        </section>
      )}

      {hasRoadmap(id) ? (
        <Link to={`/roadmap/${id}`} className="cta-road"><span aria-hidden="true">🗺</span><span className="grow">See how to get here</span><span aria-hidden="true">→</span></Link>
      ) : (
        <div className="cta-road off stack" style={{ display: 'block' }}>
          <div className="row"><span aria-hidden="true">🗺</span><span className="grow">Roadmap coming soon</span></div>
          {notifOn ? (
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => pushToast('Okay, we’ll tell you when it’s ready.', 'info')}>Notify me</button>
          ) : (
            <p className="small" style={{ marginTop: 6 }}>Want to hear when it’s ready? <Link to="/settings">Turn on role updates</Link>.</p>
          )}
        </div>
      )}

      {hasLadder(id) && (
        <Link to={`/career/${id}/ladder`} className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📈</span>
          <span className="grow">
            <strong>See how you can grow</strong>
            <span className="small muted" style={{ display: 'block' }}>{ladderChain(id)}</span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <div className="row">
        <button className="btn grow" aria-pressed={inCompare} onClick={onCompare}>{inCompare ? '✓ In Compare' : '+ Compare'}</button>
        <button className="btn grow" onClick={() => toggleShortlist(id)}>{shortlisted ? '♥ Shortlisted' : 'Shortlist'}</button>
      </div>
      {inCompare && <button className="linkbtn" onClick={() => nav('/compare')}>Go to Compare →</button>}

      <div className="card flat center stack">
        {learned ? (
          <p>Thanks for telling us. 🙌</p>
        ) : (
          <>
            <strong>Did you learn something new?</strong>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn sm" onClick={() => answerLearned(id, true)}>Yes</button>
              <button className="btn sm" onClick={() => answerLearned(id, false)}>Not really</button>
            </div>
          </>
        )}
      </div>
      <button className="linkbtn" style={{ alignSelf: 'center' }} onClick={() => openReport({ roleId: id, field: role.fields.salary.label })}>Report an error</button>
      <p className="proto-note">Entry salaries and exams are checked against public sources; other figures are estimates. Confirm on official sites before you decide.</p>
    </div>
  );
}
