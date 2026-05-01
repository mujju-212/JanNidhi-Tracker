import { Outlet, useLocation } from 'react-router-dom';
import AuditorSidebar from '../../components/common/AuditorSidebar.jsx';
import Topbar from '../../components/common/Topbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const titles = {
  dashboard: {
    title: 'CAG Dashboard',
    subtitle: 'National audit overview and leakage tracking'
  },
  'live-feed': {
    title: 'Live Transaction Feed',
    subtitle: 'Real-time transactions and flag alerts'
  },
  flags: {
    title: 'Flag Management',
    subtitle: 'Review, resolve, and escalate flags'
  },
  'raise-flag': {
    title: 'Raise Flag',
    subtitle: 'Log a manual audit flag'
  },
  reports: {
    title: 'Audit Reports',
    subtitle: 'Generate parliament-ready reports'
  }
};

export default function CAGLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const section = location.pathname.split('/').pop();
  const config = titles[section] || titles.dashboard;

  return (
    <div className="app-shell">
      <AuditorSidebar />
      <main className="main-content">
        <Topbar title={config.title} subtitle={config.subtitle} onLogout={logout} />
        <Outlet />
      </main>
    </div>
  );
}
