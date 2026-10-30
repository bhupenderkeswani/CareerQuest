import { Fragment, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import { useContent, initContent, refreshContent } from './content/content';
import { syncReports } from './lib/reports';
import { initAuth, syncNow } from './lib/account';
import { Shell } from './components/Shell';
import { Overlays } from './components/Overlays';
import Welcome from './pages/Welcome';
import ConsentApprove from './pages/ConsentApprove';
import AboutYou from './pages/AboutYou';
import Guardian from './pages/Guardian';
import Merge from './pages/Merge';
import Explore from './pages/Explore';
import CareerCard from './pages/CareerCard';
import Compare from './pages/Compare';
import ForYou from './pages/ForYou';
import QuizIntro from './pages/QuizIntro';
import QuizRun from './pages/QuizRun';
import Chat from './pages/Chat';
import Ladder from './pages/Ladder';
import Roadmaps from './pages/Roadmaps';
import Roadmap from './pages/Roadmap';
import Step from './pages/Step';
import Shortlist from './pages/Shortlist';
import Me from './pages/Me';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import DeleteAccount from './pages/DeleteAccount';
import Admin from './pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Everything past the welcome screen needs either a guest entry or an account.
function Gate({ children }) {
  const entered = useStore((s) => s.entered);
  return entered ? children : <Navigate to="/welcome" replace />;
}

function Splash() {
  return (
    <div className="onboard" role="status" aria-label="Loading careers">
      <div className="skeleton" style={{ height: 44, width: '60%' }} />
      <div className="skeleton" style={{ height: 110, marginTop: 16 }} />
      <div className="skeleton" style={{ height: 110, marginTop: 12 }} />
    </div>
  );
}

// Loads content first (cache, then network, then the bundled data) and keeps it fresh.
function Boot({ children }) {
  const loading = useContent((s) => s.loading);
  const version = useContent((s) => s.version);
  const navigate = useNavigate();
  useEffect(() => {
    initContent().then(syncReports);
    let stopAuth = () => {};
    initAuth(navigate).then((stop) => { stopAuth = stop; });
    const again = () => { refreshContent(); syncReports(); syncNow(); };
    const onVisible = () => { if (document.visibilityState === 'visible') again(); };
    window.addEventListener('online', again);
    document.addEventListener('visibilitychange', onVisible);
    return () => { stopAuth(); window.removeEventListener('online', again); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  if (loading) return <Splash />;
  // New content remounts the screens once; identical content never does.
  return <Fragment key={version}>{children}</Fragment>;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Boot>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/consent/:token" element={<ConsentApprove />} />
        <Route path="/about" element={<AboutYou />} />
        <Route path="/guardian" element={<Guardian />} />
        <Route path="/merge" element={<Merge />} />
        <Route path="/admin" element={<Admin />} />

        <Route element={<Gate><Shell /></Gate>}>
          <Route index element={<Explore />} />
          <Route path="career/:id" element={<CareerCard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="career/:id/ladder" element={<Ladder />} />
          <Route path="compare" element={<Compare />} />
          <Route path="foryou" element={<ForYou />} />
          <Route path="quiz" element={<QuizIntro />} />
          <Route path="quiz/run" element={<QuizRun />} />
          <Route path="roadmaps" element={<Roadmaps />} />
          <Route path="roadmap/:id" element={<Roadmap />} />
          <Route path="roadmap/:id/step/:stepId" element={<Step />} />
          <Route path="shortlist" element={<Shortlist />} />
          <Route path="me" element={<Me />} />
          <Route path="me/badges" element={<Badges />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/delete" element={<DeleteAccount />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </Boot>
      <Overlays />
    </HashRouter>
  );
}
