import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Wallet,
  Layers,
  ClipboardList,
  ShieldAlert,
  LineChart,
  Users,
  Settings
} from 'lucide-react';
import emblem from '../../assets/emblem.jpg';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/superadmin/dashboard' },
  { label: 'Ministry Management', icon: Building2, to: '/superadmin/ministry' },
  { label: 'Fund Allocation', icon: Wallet, to: '/superadmin/fund-allocation' },
  { label: 'Scheme Management', icon: Layers, to: '/superadmin/schemes' },
  { label: 'Transaction Monitor', icon: ClipboardList, to: '/superadmin/transactions' },
  { label: 'Audit & Alerts', icon: ShieldAlert, to: '/superadmin/audit' },
  { label: 'Reports & Analytics', icon: LineChart, to: '/superadmin/reports' },
  { label: 'User Management', icon: Users, to: '/superadmin/users' },
  { label: 'System Settings', icon: Settings, to: '/superadmin/settings' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="emblem-wrap">
          <img className="emblem" src={emblem} alt="State Emblem of India" />
        </div>
        <div>
          Finance Ministry
          <span>Government of India</span>
        </div>
      </div>

      <div className="nav-group">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
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
          <strong>Nirmala Sitharaman</strong>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Finance Minister
          </div>
        </div>
      </div>
    </aside>
  );
}
