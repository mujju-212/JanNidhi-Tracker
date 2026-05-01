import { Banknote, Users, AlertTriangle, ShieldCheck, Bell } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';

const stats = [
  { title: 'Total Funds Allocated', value: 'Rs 48210 Cr', sub: 'FY 2024-25', icon: Banknote, accent: '#0f4aa7' },
  { title: 'Reached Beneficiaries', value: 'Rs 24100 Cr', sub: 'Verified', icon: Users, accent: '#16b6a4' },
  { title: 'Leakage (Unaccounted)', value: 'Rs 4110 Cr', sub: '8.5%', icon: AlertTriangle, accent: '#e8515b' },
  { title: 'Active Flags', value: '47', sub: 'Open cases', icon: ShieldCheck, accent: '#334155' },
  { title: 'Auto-Flags Today', value: '9', sub: 'Real-time', icon: Bell, accent: '#1aa26f' }
];

const criticalFlags = [
  { id: 'FLAG-2024-047', issue: 'Unregistered wallet', ministry: 'MoRD', state: 'Bihar', severity: 'critical' },
  { id: 'FLAG-2024-046', issue: 'UC hash mismatch', ministry: 'MoHFW', state: 'Rajasthan', severity: 'high' }
];

const liveFeed = [
  { id: 'TXN-2024-001', info: 'MoHFW -> MH Rs 45 Cr', status: 'normal' },
  { id: 'TXN-2024-002', info: 'MoAgri -> UP Rs 120 Cr', status: 'normal' },
  { id: 'TXN-2024-003', info: 'MoRD -> Bihar Rs 2.3 Cr', status: 'flagged' }
];

export default function CAGDashboard() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid two">
        <Card title="Live Feed Preview" action={<button className="btn secondary">View Full Feed</button>}>
          <div style={{ display: 'grid', gap: '10px' }}>
            {liveFeed.map((item) => (
              <div key={item.id} className="stat-card">
                <div className="stat-meta">
                  <strong>{item.id}</strong>
                  <span>{item.info}</span>
                </div>
                <Badge
                  tone={item.status === 'flagged' ? 'critical' : 'low'}
                  label={item.status === 'flagged' ? 'FLAGGED' : 'NORMAL'}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Critical Flags">
          <div style={{ display: 'grid', gap: '10px' }}>
            {criticalFlags.map((flag) => (
              <div key={flag.id} className="stat-card">
                <div className="stat-meta">
                  <strong>{flag.id}</strong>
                  <span>{flag.issue}</span>
                  <span>{flag.ministry} · {flag.state}</span>
                </div>
                <Badge tone={flag.severity} label={flag.severity.toUpperCase()} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
