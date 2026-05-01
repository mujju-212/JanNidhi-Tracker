import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  WalletCards,
  FilePlus2,
  ListChecks,
  Building2,
  BarChart3,
  Send,
  ShieldAlert,
  ClipboardList,
  LineChart
} from 'lucide-react';
import emblem from '../../assets/emblem.jpg';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/ministry/dashboard' },
  { label: 'View Budget', icon: WalletCards, to: '/ministry/view-budget' },
  { label: 'Create Scheme', icon: FilePlus2, to: '/ministry/create-scheme' },
  { label: 'Scheme List', icon: ListChecks, to: '/ministry/schemes' },
  { label: 'State Accounts', icon: Building2, to: '/ministry/states' },
  { label: 'State Progress', icon: BarChart3, to: '/ministry/state-progress' },
  { label: 'Release Funds', icon: Send, to: '/ministry/release-funds' },
  { label: 'Flag Center', icon: ShieldAlert, to: '/ministry/flags' },
  { label: 'Transactions', icon: ClipboardList, to: '/ministry/transactions' },
  { label: 'Reports', icon: LineChart, to: '/ministry/reports' }
];

export default function MinistrySidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="emblem-wrap">
          <img className="emblem" src={emblem} alt="State Emblem of India" />
        </div>
        <div>
          Ministry Admin
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
          <strong>Dr. Rajesh Kumar</strong>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Secretary, MoHFW
          </div>
        </div>
      </div>
    </aside>
  );
}
