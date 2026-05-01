import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  WalletCards,
  Send,
  ClipboardList,
  ShieldAlert,
  FilePlus2,
  ListChecks,
  Building2,
  BarChart3,
  UploadCloud,
  LineChart
} from 'lucide-react';
import emblem from '../../assets/emblem.jpg';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/state/dashboard' },
  { label: 'View Funds', icon: WalletCards, to: '/state/view-funds' },
  { label: 'Release Funds', icon: Send, to: '/state/release-funds' },
  { label: 'Release Matching', icon: UploadCloud, to: '/state/release-matching' },
  { label: 'State Schemes', icon: ListChecks, to: '/state/state-schemes' },
  { label: 'Create Scheme', icon: FilePlus2, to: '/state/create-state-scheme' },
  { label: 'District Accounts', icon: Building2, to: '/state/districts' },
  { label: 'District Progress', icon: BarChart3, to: '/state/district-progress' },
  { label: 'Submit UC', icon: UploadCloud, to: '/state/submit-uc' },
  { label: 'Transactions', icon: ClipboardList, to: '/state/transactions' },
  { label: 'Flag Center', icon: ShieldAlert, to: '/state/flags' },
  { label: 'Reports', icon: LineChart, to: '/state/reports' }
];

export default function StateSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="emblem-wrap">
          <img className="emblem" src={emblem} alt="State Emblem of India" />
        </div>
        <div>
          State Finance Dept
          <span>JanNidhi Tracker</span>
        </div>
      </div>

      <div className="nav-group">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="avatar" />
        <div>
          <strong>Shri Ajit Pawar</strong>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            State Finance Officer
          </div>
        </div>
      </div>
    </aside>
  );
}
