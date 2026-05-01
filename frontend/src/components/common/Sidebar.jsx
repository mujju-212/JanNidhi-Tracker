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
import { useAuth } from '../../context/AuthContext.jsx';

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
  const { user } = useAuth();
  const displayName = user?.fullName || 'Super Admin';
  const displayRole = user?.designation || 'Finance Minister';
  const profilePicture = user?.profilePicture || '';

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

      <NavLink
        to="/superadmin/profile"
        className={({ isActive }) =>
          `sidebar-footer sidebar-profile-link${isActive ? ' active' : ''}`
        }
      >
        <div className="avatar">{profilePicture ? <img src={profilePicture} alt={displayName} /> : null}</div>
        <div>
          <strong>{displayName}</strong>
          <div className="helper">{displayRole}</div>
        </div>
      </NavLink>
    </aside>
  );
}
