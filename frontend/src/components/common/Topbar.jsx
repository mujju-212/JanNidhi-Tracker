import { Bell, CalendarDays, LogOut } from 'lucide-react';

export default function Topbar({ title, subtitle, onLogout }) {
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-actions">
        <div className="control-pill">
          <CalendarDays size={16} />
          FY 2024-25
        </div>
        <div className="control-pill">
          <Bell size={16} />
          Alerts
        </div>
        <button className="btn secondary" onClick={onLogout} type="button">
          <LogOut size={16} style={{ marginRight: '6px' }} />
          Logout
        </button>
      </div>
    </div>
  );
}
