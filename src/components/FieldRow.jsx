import { useStore } from '../store';

// One number on a card: its value and ⓘ for the source. How fresh the data is lives in Me ("About the data").
export function FieldRow({ role, k }) {
  const openInfo = useStore((s) => s.openInfo);
  const openFieldInfo = useStore((s) => s.openFieldInfo);
  const fld = role.fields[k];
  return (
    <div className="fieldrow">
      <div className="grow">
        <div className="lbl-s">{fld.label}</div>
        <div className="val">{fld.value}</div>
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
        <button
          className="linkbtn small"
          aria-label={`Source for ${fld.label.toLowerCase()} of ${role.name}`}
          onClick={() => { openFieldInfo(`${role.id}.${k}`); openInfo({ roleId: role.id, fieldKey: k }); }}
        >
          ⓘ Source
        </button>
      </div>
    </div>
  );
}
