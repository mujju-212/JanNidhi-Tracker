import { Outlet, useLocation } from 'react-router-dom';
import MinistrySidebar from '../../components/common/MinistrySidebar.jsx';
import Topbar from '../../components/common/Topbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const titles = {
  dashboard: {
    title: 'Ministry Dashboard',
    subtitle: 'Overview of ministry funds and schemes'
  },
  'view-budget': {
    title: 'View Budget',
    subtitle: 'Allocations received from the Finance Ministry'
  },
  'create-scheme': {
    title: 'Create Scheme',
    subtitle: 'Define a new scheme and lock rules on chain'
  },
  schemes: {
    title: 'Scheme List',
    subtitle: 'Track active and completed schemes'
  },
  scheme: {
    title: 'Scheme Detail',
    subtitle: 'State-wise progress and utilization'
  },
  'create-state': {
    title: 'Create State Account',
    subtitle: 'Provision state finance departments'
  },
  states: {
    title: 'State Accounts',
    subtitle: 'Monitor state admins and wallets'
  },
  'state-progress': {
    title: 'State Progress',
    subtitle: 'Track releases and utilization across states'
  },
  'release-funds': {
    title: 'Release Funds',
    subtitle: 'Disburse funds to state governments'
  },
  transactions: {
    title: 'Transactions',
    subtitle: 'Monitor ministry-level fund transfers'
  },
  flags: {
    title: 'Flag Center',
    subtitle: 'Review scheme and state anomalies'
  },
  reports: {
    title: 'Reports',
    subtitle: 'Generate ministry compliance reports'
  },
  profile: {
    title: 'User Profile',
    subtitle: 'Manage account details and profile picture'
  }
};

export default function MinLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const section = location.pathname.split('/')[2];
  const config = titles[section] || titles.dashboard;

  return (
    <div className="app-shell">
      <MinistrySidebar />
      <main className="main-content">
        <Topbar title={config.title} subtitle={config.subtitle} onLogout={logout} />
        <Outlet />
      </main>
    </div>
  );
}
