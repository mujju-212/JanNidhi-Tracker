import {
  Landmark,
  Banknote,
  Send,
  Users,
  Flag,
  Building2
} from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import FundFlowSankey from '../../components/charts/FundFlowSankey.jsx';
import UtilizationDonut from '../../components/charts/UtilizationDonut.jsx';
import IndiaMapPanel from '../../components/charts/IndiaMapPanel.jsx';

const statCards = [
  {
    title: 'Total Budget (Approved)',
    value: '₹48.21 L Cr',
    sub: '100% of Total Budget',
    accent: '#0f4aa7',
    icon: Landmark
  },
  {
    title: 'Total Allocated',
    value: '₹32.14 L Cr',
    sub: '66.7% of Total Budget',
    accent: '#16b6a4',
    icon: Banknote
  },
  {
    title: 'Total Released',
    value: '₹28.90 L Cr',
    sub: '60.0% of Total Budget',
    accent: '#1aa26f',
    icon: Send
  },
  {
    title: 'Reached Beneficiaries',
    value: '₹24.10 L Cr',
    sub: '49.98% of Total Budget',
    accent: '#0f7aa7',
    icon: Users
  },
  {
    title: 'Active Flags',
    value: '47',
    sub: 'Needs attention',
    accent: '#e8515b',
    icon: Flag
  },
  {
    title: 'Active Ministries',
    value: '28',
    sub: 'Across India',
    accent: '#334155',
    icon: Building2
  }
];

const sankeyData = {
  nodes: [
    { name: 'Finance Ministry' },
    { name: 'Rural Development' },
    { name: 'Education' },
    { name: 'Health & Family Welfare' },
    { name: 'Agriculture' },
    { name: 'Uttar Pradesh' },
    { name: 'Maharashtra' },
    { name: 'Bihar' },
    { name: 'West Bengal' },
    { name: 'District 1' },
    { name: 'District 2' },
    { name: 'District 3' },
    { name: 'District 4' },
    { name: 'Beneficiaries' }
  ],
  links: [
    { source: 0, target: 1, value: 84.5 },
    { source: 0, target: 2, value: 62.1 },
    { source: 0, target: 3, value: 58.8 },
    { source: 0, target: 4, value: 47.75 },
    { source: 1, target: 5, value: 26.2 },
    { source: 2, target: 6, value: 14.8 },
    { source: 3, target: 7, value: 24.2 },
    { source: 4, target: 8, value: 23.7 },
    { source: 5, target: 9, value: 12.5 },
    { source: 6, target: 10, value: 11.8 },
    { source: 7, target: 11, value: 10.5 },
    { source: 8, target: 12, value: 9.95 },
    { source: 9, target: 13, value: 12.5 },
    { source: 10, target: 13, value: 11.8 },
    { source: 11, target: 13, value: 10.5 },
    { source: 12, target: 13, value: 9.95 }
  ]
};

const utilizationData = [
  { name: 'Released', value: 60, color: '#0f4aa7' },
  { name: 'Utilized', value: 49.98, color: '#16b6a4' },
  { name: 'Unutilized', value: 10.02, color: '#f2a93b' }
];

const alerts = [
  {
    id: 'FLAG-2024-047',
    type: 'Duplicate Beneficiary',
    description: 'Aadhaar XXXX-XXXX-1234 already exists',
    location: 'Bihar, Gaya',
    severity: 'high',
    date: '20 May 2024'
  },
  {
    id: 'FLAG-2024-046',
    type: 'Payment Anomaly',
    description: 'Amount exceeds threshold limit',
    location: 'UP, Lucknow',
    severity: 'medium',
    date: '20 May 2024'
  },
  {
    id: 'FLAG-2024-045',
    type: 'Inactive Account',
    description: 'Bank account inactive for 90+ days',
    location: 'MP, Bhopal',
    severity: 'low',
    date: '19 May 2024'
  },
  {
    id: 'FLAG-2024-044',
    type: 'Geo mismatch',
    description: 'Location data mismatch detected',
    location: 'RJ, Jaipur',
    severity: 'medium',
    date: '19 May 2024'
  },
  {
    id: 'FLAG-2024-043',
    type: 'Document Expiry',
    description: 'KYC document expired',
    location: 'WB, Kolkata',
    severity: 'low',
    date: '18 May 2024'
  }
];

export default function SADashboard() {
  return (
    <div className="grid" style={{ gap: '22px' }}>
      <div className="grid stats">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid two">
        <Card title="Live Fund Flow (Sankey View)" action={<button className="btn secondary">View Fullscreen</button>}>
          <FundFlowSankey data={sankeyData} />
        </Card>
        <Card title="Fund Utilization Overview" action={<span className="helper">This Year</span>}>
          <UtilizationDonut data={utilizationData} />
          <div style={{ display: 'grid', gap: '8px' }}>
            <div className="helper">Released: ₹28.90 L Cr (60%)</div>
            <div className="helper">Utilized: ₹24.10 L Cr (49.98%)</div>
            <div className="helper">Unutilized: ₹4.80 L Cr (10.02%)</div>
          </div>
        </Card>
      </div>

      <div className="grid bottom">
        <Card title="Recent Alerts & Flags" action={<button className="btn secondary">View All Alerts</button>}>
          <table className="table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.id}</td>
                  <td>{alert.type}</td>
                  <td>{alert.description}</td>
                  <td>{alert.location}</td>
                  <td>
                    <Badge tone={alert.severity} label={alert.severity.toUpperCase()} />
                  </td>
                  <td>{alert.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Funds Distribution Across India" action={<button className="btn secondary">View Full Map</button>}>
          <IndiaMapPanel />
        </Card>
      </div>
    </div>
  );
}
