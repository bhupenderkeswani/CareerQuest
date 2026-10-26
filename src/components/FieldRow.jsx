import { useStore } from '../store';
import { ageLabel, isStale } from '../lib/freshness';

// One number on a card: value, how old it is, a per-field "may be outdated" tag, and ⓘ for the source.
export function FieldRow({ role, k }) {
  const openInfo = useStore((s) => s.openInfo);
  const openFieldInfo = useStore((s) => s.openFieldInfo);
  const fld = role.fields[k];
  const stale = isStale(fld.updated);
  return (
    <div className="fieldrow">
      <div className="grow">
        <div className="lbl-s">{fld.label}</div>
        <div className="val">{fld.value}</div>
        <div className="meta">
          <span>Updated {ageLabel(fld.updated)}</span>
          {stale && <span className="tag warn">⚠ May be outdated</span>}
        </div>
      </div>
      <button
        className="infobtn"
        aria-label={`Where does ${fld.label.toLowerCase()} come from?`}
        onClick={() => { openFieldInfo(`${role.id}.${k}`); openInfo({ roleId: role.id, fieldKey: k }); }}
      >
        ⓘ
      </button>
    </div>
  );
}

// Compact variant used inside the compare table.
export function FieldCell({ role, k }) {
  const openInfo = useStore((s) => s.openInfo);
  const openFieldInfo = useStore((s) => s.openFieldInfo);
  const fld = role.fields[k];
  return (
    <div>
      <div>{fld.value}</div>
      <div className="row small muted" style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
        <span>{ageLabel(fld.updated)}</span>
        {isStale(fld.updated) && <span className="tag warn">May be outdated</span>}
        <button
          className="linkbtn small"
          aria-label={`Source for ${fld.label.toLowerCase()} of ${role.name}`}
          onClick={() => { openFieldInfo(`${role.id}.${k}`); openInfo({ roleId: role.id, fieldKey: k }); }}
        >
          ⓘ
        </button>
      </div>
    </div>
  );
}
