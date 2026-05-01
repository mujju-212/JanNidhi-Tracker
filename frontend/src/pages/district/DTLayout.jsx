import { Outlet, useLocation } from 'react-router-dom';
import DistrictSidebar from '../../components/common/DistrictSidebar.jsx';
import Topbar from '../../components/common/Topbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const titles = {
  dashboard: {
    title: 'District Dashboard',
    subtitle: 'Beneficiary enrollment and payment overview'
  },
  'add-beneficiary': {
    title: 'Add Beneficiary',
    subtitle: 'Verify Aadhaar, fetch bank details, and enroll'
  },
  'bulk-enroll': {
    title: 'Bulk Enroll',
    subtitle: 'Upload CSV for mass beneficiary enrollment'
  },
  beneficiaries: {
    title: 'Beneficiary List',
    subtitle: 'Search and manage enrolled beneficiaries'
  },
  'trigger-payment': {
    title: 'Trigger Payment',
    subtitle: 'Process batch payments and monitor status'
  },
  'payment-status': {
    title: 'Payment Status',
    subtitle: 'Track batch results and failures'
  },
  'held-payments': {
    title: 'Held Payments',
    subtitle: 'Resolve blocked transactions'
  },
  'view-funds': {
    title: 'View Funds',
    subtitle: 'Funds received from state'
  },
  'release-funds': {
    title: 'Release Funds',
    subtitle: 'Disburse funds to panchayats'
  },
  transactions: {
    title: 'Transactions',
    subtitle: 'Track district-level transfers'
  },
  blocks: {
    title: 'Block Accounts',
    subtitle: 'Manage block-level accounts'
  },
  'create-block': {
    title: 'Create Block',
    subtitle: 'Provision new block accounts'
  },
  panchayats: {
    title: 'Panchayat Accounts',
    subtitle: 'Manage panchayat-level accounts'
  },
  'create-panchayat': {
    title: 'Create Panchayat',
    subtitle: 'Provision new panchayat accounts'
  },
  complaints: {
    title: 'Complaints',
    subtitle: 'Respond to citizen complaints'
  },
  flags: {
    title: 'Flag Center',
    subtitle: 'Review district-level flags'
  },
  'submit-uc': {
    title: 'Submit Utilization Certificate',
    subtitle: 'Share UC documents with the state'
  }
};

export default function DTLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const section = location.pathname.split('/')[2];
  const config = titles[section] || titles.dashboard;

  return (
    <div className="app-shell">
      <DistrictSidebar />
      <main className="main-content">
        <Topbar title={config.title} subtitle={config.subtitle} onLogout={logout} />
        <Outlet />
      </main>
    </div>
  );
}
