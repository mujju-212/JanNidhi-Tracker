import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const getCurrentFY = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYear}`;
};

export default function Topbar({ title, subtitle, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentFY = useMemo(() => getCurrentFY(), []);
  const [selectedFY, setSelectedFY] = useState(() => {
    try {
      return localStorage.getItem('jn_selected_fy') || currentFY;
    } catch {
      return currentFY;
    }
  });

  const fyOptions = useMemo(() => {
    const startYear = Number(currentFY.slice(0, 4));
    return [-1, 0, 1, 2].map((offset) => {
      const start = startYear + offset;
      const end = String((start + 1) % 100).padStart(2, '0');
      return `${start}-${end}`;
    });
  }, [currentFY]);

  useEffect(() => {
    try {
      localStorage.setItem('jn_selected_fy', selectedFY);
    } catch {
      // no-op: localStorage might be unavailable
    }
  }, [selectedFY]);

  const alertsRoute = useMemo(() => {
    if (location.pathname.startsWith('/superadmin')) return '/superadmin/audit';
    if (location.pathname.startsWith('/ministry')) return '/ministry/flags';
    if (location.pathname.startsWith('/state')) return '/state/flags';
    if (location.pathname.startsWith('/district')) return '/district/flags';
    if (location.pathname.startsWith('/auditor')) return '/auditor/flags';
    return null;
  }, [location.pathname]);

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-actions">
        <div className="control-pill">
          <CalendarDays size={16} />
          <select
            aria-label="Financial Year"
            className="control-select"
            value={selectedFY}
            onChange={(event) => setSelectedFY(event.target.value)}
          >
            {fyOptions.map((fy) => (
              <option key={fy} value={fy}>
                FY {fy}
              </option>
            ))}
          </select>
        </div>
        <button
          className="control-pill control-pill-button"
          type="button"
          onClick={() => {
            if (alertsRoute) navigate(alertsRoute);
          }}
          disabled={!alertsRoute}
        >
          <Bell size={16} />
          Alerts
        </button>
        <button className="btn secondary" onClick={onLogout} type="button">
          <LogOut size={16} style={{ marginRight: '6px' }} />
          Logout
        </button>
      </div>
    </div>
  );
}
