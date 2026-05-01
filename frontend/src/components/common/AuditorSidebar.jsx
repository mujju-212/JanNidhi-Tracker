import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, ShieldCheck, FlagTriangleRight, FileText } from 'lucide-react';
import emblem from '../../assets/emblem.jpg';
import { useAuth } from '../../context/AuthContext.jsx';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/auditor/dashboard' },
  { label: 'Live Feed', icon: Activity, to: '/auditor/live-feed' },
  { label: 'Flag Management', icon: ShieldCheck, to: '/auditor/flags' },
  { label: 'Raise Flag', icon: FlagTriangleRight, to: '/auditor/raise-flag' },
  { label: 'Reports', icon: FileText, to: '/auditor/reports' }
];

export default function AuditorSidebar() {
  const { user } = useAuth();
  const displayName = user?.fullName || 'CAG Auditor';
  const displayRole = user?.designation || 'Central Auditor';
  const profilePicture = user?.profilePicture || '';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="emblem-wrap">
          <img className="emblem" src={emblem} alt="State Emblem of India" />
        </div>
        <div>
          CAG Auditor
          <span>Audit Command Center</span>
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

      <NavLink
        to="/auditor/profile"
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
