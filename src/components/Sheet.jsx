import { useEffect, useRef } from 'react';

// Bottom sheet (or centred modal) with Escape-to-close, scrim click and initial focus.
export function Sheet({ onClose, label, modal = false, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);

  return (
    <div className={`scrim${modal ? ' modal' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={modal ? 'modalbox' : 'sheet'} style={{ outline: 'none' }}>
        {!modal && <div className="grab" />}
        {children}
      </div>
    </div>
  );
}
