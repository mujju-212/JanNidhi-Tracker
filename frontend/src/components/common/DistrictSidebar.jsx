import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  Send,
  ClipboardList,
  MessageCircle,
  ShieldAlert,
  UploadCloud,
  Building2,
  WalletCards,
  FileText
} from 'lucide-react';
import emblem from '../../assets/emblem.jpg';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/district/dashboard' },
  { label: 'View Funds', icon: WalletCards, to: '/district/view-funds' },
  { label: 'Release Funds', icon: Send, to: '/district/release-funds' },
  { label: 'Add Beneficiary', icon: UserPlus, to: '/district/add-beneficiary' },
  { label: 'Bulk Enroll', icon: UploadCloud, to: '/district/bulk-enroll' },
  { label: 'Beneficiary List', icon: Users, to: '/district/beneficiaries' },
  { label: 'Trigger Payment', icon: CreditCard, to: '/district/trigger-payment' },
  { label: 'Payment Status', icon: FileText, to: '/district/payment-status' },
  { label: 'Held Payments', icon: FileText, to: '/district/held-payments' },
  { label: 'Transactions', icon: ClipboardList, to: '/district/transactions' },
  { label: 'Taluk Accounts', icon: Building2, to: '/district/blocks' },
  { label: 'Panchayat Accounts', icon: Building2, to: '/district/panchayats' },
  { label: 'Complaints', icon: MessageCircle, to: '/district/complaints' },
  { label: 'Flag Center', icon: ShieldAlert, to: '/district/flags' },
  { label: 'Submit UC', icon: UploadCloud, to: '/district/submit-uc' }
];

export default function DistrictSidebar() {
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

      <div className="sidebar-footer">
        <div className="avatar" />
        <div>
          <strong>Shri Rajesh Patil</strong>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            District Collector
          </div>
        </div>
      </div>
    </aside>
  );
}
