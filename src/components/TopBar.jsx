import { useNavigate } from 'react-router-dom';

export function TopBar({ title, back = true, backTo, children }) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      {back && (
        <button className="iconbtn" aria-label="Go back" onClick={() => (backTo ? nav(backTo) : nav(-1))}>←</button>
      )}
      <h1>{title}</h1>
      {children}
    </div>
  );
}
