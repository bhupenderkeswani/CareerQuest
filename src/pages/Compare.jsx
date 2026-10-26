import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, useRoles } from '../store';
import { CAREERS, CHILDREN, FIELD_KEYS, TOP_LEVEL } from '../data/careers';
import { FieldCell } from '../components/FieldRow';
import { TopBar } from '../components/TopBar';
import { ladderChain } from '../data/ladders';

// S8: side-by-side compare. Rows are fixed and columns follow the order you picked:
// nothing is sorted or highlighted by pay.
export default function Compare() {
  const ids = useStore((s) => s.compare);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const viewCompare = useStore((s) => s.viewCompare);
  const pushToast = useStore((s) => s.pushToast);
  const roles = useRoles(ids);
  const [q, setQ] = useState('');
  const addable = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term) return CAREERS.filter((c) => !ids.includes(c.id) && c.name.toLowerCase().includes(term));
    // Top-level roles, plus the specialisations of anything already in the compare list.
    const kids = ids.flatMap((id) => (CHILDREN[id] || []).map((c) => c.id));
    return CAREERS.filter((c) => !ids.includes(c.id) && (TOP_LEVEL.includes(c) || kids.includes(c.id)));
  }, [q, ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { viewCompare(ids); }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="stack">
      <TopBar title="Compare careers" backTo="/" />
      {ids.length < 2 && (
        <p className="muted">Pick at least two careers to compare. Three gives you a 3-way compare.</p>
      )}

      {roles.length > 0 && (
        <div className="cmp card">
          <table>
            <thead>
              <tr>
                <th className="rowhead" scope="col"><span className="sr-only">Field</span></th>
                {roles.map((r) => (
                  <th key={r.id} scope="col">
                    <div className="colhead">{r.emoji} {r.name}</div>
                    <div className="row small" style={{ gap: 10, marginTop: 4, fontWeight: 400 }}>
                      <Link to={`/career/${r.id}`}>Open card</Link>
                      <button className="linkbtn small" onClick={() => toggleCompare(r.id)} aria-label={`Remove ${r.name} from compare`}>Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELD_KEYS.map((k) => (
                <tr key={k}>
                  <th className="rowhead" scope="row">{roles[0].fields[k].label}</th>
                  {roles.map((r) => <td key={r.id}><FieldCell role={r} k={k} /></td>)}
                </tr>
              ))}
              <tr>
                <th className="rowhead" scope="row">Growth path</th>
                {roles.map((r) => (
                  <td key={r.id}>
                    <div>{ladderChain(r.id, 4) || 'Coming soon'}</div>
                    {ladderChain(r.id) && <Link className="small" to={`/career/${r.id}/ladder`}>Open ladder</Link>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {ids.length < 3 && (
        <div>
          <div className="sectionhead"><h2>Add a career</h2></div>
          <input className="field-input" type="search" placeholder="Search, for example surgeon or frontend" aria-label="Search careers to compare" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 10 }} />
          <div className="chips" style={{ flexWrap: 'wrap' }}>
            {addable.map((c) => (
              <button key={c.id} className="chip" onClick={() => { if (!toggleCompare(c.id)) pushToast('You can compare up to 3 careers.', 'info'); }}>
                {c.emoji} {c.name}
              </button>
            ))}
            {addable.length === 0 && <span className="muted small">No match. Try another word.</span>}
          </div>
        </div>
      )}
      <p className="small muted">Higher pay isn’t better or worse. Look at study time, exams and demand too.</p>
    </div>
  );
}
