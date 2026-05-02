import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  ClipboardList,
  MessageCircle,
  ShieldAlert,
  UploadCloud,
  WalletCards,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import emblem from '../../assets/emblem.jpg';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/district/dashboard' },
  { label: 'View Funds', icon: WalletCards, to: '/district/view-funds' },
  { label: 'Add Beneficiary', icon: UserPlus, to: '/district/add-beneficiary' },
  { label: 'Bulk Enroll', icon: UploadCloud, to: '/district/bulk-enroll' },
  { label: 'Beneficiary List', icon: Users, to: '/district/beneficiaries' },
  { label: 'Trigger Payment', icon: CreditCard, to: '/district/trigger-payment' },
  { label: 'Payment Status', icon: FileText, to: '/district/payment-status' },
  { label: 'Transactions', icon: ClipboardList, to: '/district/transactions' },
  { label: 'Complaints', icon: MessageCircle, to: '/district/complaints' },
  { label: 'Flag Center', icon: ShieldAlert, to: '/district/flags' },
  { label: 'Submit UC', icon: UploadCloud, to: '/district/submit-uc' }
];

export default function DistrictSidebar() {
  const { user } = useAuth();
  const displayName = user?.fullName || 'District Admin';
  const displayRole = user?.designation || 'District Collector';
  const profilePicture = user?.profilePicture || '';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="emblem-wrap">
          <img className="emblem" src={emblem} alt="State Emblem of India" />
        </div>
        <div>
          District Admin
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

      <NavLink
        to="/district/profile"
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
