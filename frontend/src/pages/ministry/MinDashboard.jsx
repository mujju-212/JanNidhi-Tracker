import { Banknote, Send, Wallet, Layers, ShieldAlert } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';

const stats = [
  { title: 'Received from Centre', value: 'Rs 22186 Cr', sub: 'FY 2024-25', icon: Banknote, accent: '#0f4aa7' },
  { title: 'Released to States', value: 'Rs 18400 Cr', sub: 'Across 18 states', icon: Send, accent: '#16b6a4' },
  { title: 'Remaining Balance', value: 'Rs 3786 Cr', sub: 'Available now', icon: Wallet, accent: '#1aa26f' },
  { title: 'Active Schemes', value: '4', sub: 'Running', icon: Layers, accent: '#334155' },
  { title: 'Active Flags', value: '3', sub: 'Needs response', icon: ShieldAlert, accent: '#e8515b' }
];

const schemes = [
  { name: 'Ayushman Bharat', allocated: '7200', released: '6100', progress: 85 },
  { name: 'PM POSHAN', allocated: '6000', released: '5800', progress: 97 },
  { name: 'NHM', allocated: '5000', released: '4500', progress: 90 }
];

const flags = [
  { id: 'FLAG-2024-047', issue: 'Rs 50L unaccounted', status: 'critical' },
  { id: 'FLAG-2024-046', issue: 'Delayed release', status: 'high' },
  { id: 'FLAG-2024-045', issue: 'UC pending', status: 'medium' }
];

export default function MinDashboard() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Card title="Scheme-wise Progress">
        <table className="table">
          <thead>
            <tr>
              <th>Scheme</th>
              <th>Allocated (Cr)</th>
              <th>Released (Cr)</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((scheme) => (
              <tr key={scheme.name}>
                <td>{scheme.name}</td>
                <td>Rs {scheme.allocated}</td>
                <td>Rs {scheme.released}</td>
                <td>
                  <div className="progress">
                    <span style={{ width: `${scheme.progress}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Recent Flags">
        <div style={{ display: 'grid', gap: '10px' }}>
          {flags.map((flag) => (
            <div key={flag.id} className="stat-card">
              <div className="stat-meta">
                <strong>{flag.id}</strong>
                <span>{flag.issue}</span>
              </div>
              <Badge tone={flag.status} label={flag.status.toUpperCase()} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
