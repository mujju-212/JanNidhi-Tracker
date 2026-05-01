import { Outlet, useLocation } from 'react-router-dom';
import StateSidebar from '../../components/common/StateSidebar.jsx';
import Topbar from '../../components/common/Topbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const titles = {
  dashboard: {
    title: 'State Dashboard',
    subtitle: 'State finance overview and fund progress'
  },
  'view-funds': {
    title: 'View Received Funds',
    subtitle: 'Funds received from central ministries'
  },
  'release-funds': {
    title: 'Release Funds to Districts',
    subtitle: 'Disburse funds and upload UCs'
  },
  'release-matching': {
    title: 'Release Matching Share',
    subtitle: 'Publish state share for CSS schemes'
  },
  'create-state-scheme': {
    title: 'Create State Scheme',
    subtitle: 'Submit state schemes for approval'
  },
  'state-schemes': {
    title: 'State Schemes',
    subtitle: 'Monitor state-funded initiatives'
  },
  'create-district': {
    title: 'Create District Account',
    subtitle: 'Provision district finance offices'
  },
  districts: {
    title: 'District Accounts',
    subtitle: 'Monitor district admins and wallets'
  },
  'district-progress': {
    title: 'District Progress',
    subtitle: 'Track releases and utilization across districts'
  },
  'submit-uc': {
    title: 'Submit Utilization Certificate',
    subtitle: 'Share UC documents with the ministry'
  },
  transactions: {
    title: 'State Transactions',
    subtitle: 'Track state-level transfers'
  },
  flags: {
    title: 'Flag Center',
    subtitle: 'Review flags within the state'
  },
  reports: {
    title: 'Reports',
    subtitle: 'Generate state compliance reports'
  }
};

export default function STLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const section = location.pathname.split('/')[2];
  const config = titles[section] || titles.dashboard;

  return (
    <div className="app-shell">
      <StateSidebar />
      <main className="main-content">
        <Topbar title={config.title} subtitle={config.subtitle} onLogout={logout} />
        <Outlet />
      </main>
    </div>
  );
}
