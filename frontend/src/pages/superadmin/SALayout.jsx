import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar.jsx';
import Topbar from '../../components/common/Topbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const titles = {
  dashboard: {
    title: 'Central Dashboard',
    subtitle: 'Real-time overview of public fund management across India'
  },
  ministry: {
    title: 'Ministry Management',
    subtitle: 'Create, review, and monitor ministry accounts'
  },
  'create-ministry': {
    title: 'Create Ministry Account',
    subtitle: 'Provision a new ministry with access credentials'
  },
  'create-cag': {
    title: 'Create CAG Account',
    subtitle: 'Register national and state auditors'
  },
  'fund-allocation': {
    title: 'Fund Allocation',
    subtitle: 'Allocate budgets and track approvals'
  },
  'allocate-budget': {
    title: 'Fund Allocation',
    subtitle: 'Allocate budgets and track approvals'
  },
  schemes: {
    title: 'Scheme Management',
    subtitle: 'Monitor scheme creation and progress'
  },
  transactions: {
    title: 'Transaction Monitor',
    subtitle: 'Observe all fund transfers in one view'
  },
  audit: {
    title: 'Audit & Alerts',
    subtitle: 'Investigate flags and anomalies'
  },
  flags: {
    title: 'Flag Center',
    subtitle: 'Review and resolve audit flags'
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Generate ministry and scheme reports'
  },
  users: {
    title: 'User Management',
    subtitle: 'Manage role access and users'
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Configure system rules and controls'
  }
};

export default function SALayout() {
  const location = useLocation();
  const { logout } = useAuth();

  const section = location.pathname.split('/')[2];
  const config = titles[section] || titles.dashboard;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Topbar
          title={config.title}
          subtitle={config.subtitle}
          onLogout={logout}
        />
        <Outlet />
      </main>
    </div>
  );
}
