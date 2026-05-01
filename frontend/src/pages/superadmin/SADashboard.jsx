import { useEffect, useState } from 'react';
import { Landmark, Send, Users, Flag, Building2 } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import FundFlowSankey from '../../components/charts/FundFlowSankey.jsx';
import UtilizationDonut from '../../components/charts/UtilizationDonut.jsx';
import IndiaMapPanel from '../../components/charts/IndiaMapPanel.jsx';
import { apiGet } from '../../services/api.js';

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

const formatCrore = (value) => {
  if (value === null || value === undefined) return '-';
  return `Rs ${Number(value).toFixed(2)} Cr`;
};

export default function SADashboard() {
  const [stats, setStats] = useState({
    allocated: 0,
    released: 0,
    paid: 0,
    activeFlags: 0,
    ministries: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      apiGet('/api/public/stats'),
      apiGet('/api/superadmin/dashboard'),
      apiGet('/api/superadmin/flags')
    ])
      .then(([publicStats, adminStats, flagsResponse]) => {
        if (!mounted) return;
        const publicData = publicStats?.data || {};
        const adminData = adminStats?.data || {};

        setStats({
          allocated: publicData.allocated ?? adminData.allocated ?? 0,
          released: publicData.released ?? adminData.released ?? 0,
          paid: publicData.paidToBeneficiaries ?? 0,
          activeFlags: adminData.activeFlags ?? publicData.activeFlags ?? 0,
          ministries: adminData.ministries ?? 0
        });

        const flags = flagsResponse?.data || [];
        const mapped = flags.slice(0, 6).map((flag) => ({
          id: flag.flagId,
          type: flag.flagCode || 'FLAG',
          description: flag.flagReason || 'Flag raised',
          location: [flag.stateCode, flag.districtCode].filter(Boolean).join(', ') || '-',
          severity: flag.flagType || 'info',
          date: flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : '-'
        }));
        setAlerts(mapped);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load dashboard data.');
        setAlerts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = [
    {
      title: 'Total Allocated',
      value: formatCrore(stats.allocated),
      sub: 'Allocated from finance ministry',
      accent: '#2f6fdc',
      icon: Landmark
    },
    {
      title: 'Total Released',
      value: formatCrore(stats.released),
      sub: 'Released downstream',
      accent: '#2458b7',
      icon: Send
    },
    {
      title: 'Reached Beneficiaries',
      value: formatCrore(stats.paid),
      sub: 'Paid to citizens',
      accent: '#1aa26f',
      icon: Users
    },
    {
      title: 'Active Flags',
      value: String(stats.activeFlags || 0),
      sub: 'Needs attention',
      accent: '#e25562',
      icon: Flag
    },
    {
      title: 'Active Ministries',
      value: String(stats.ministries || 0),
      sub: 'Admin accounts',
      accent: '#334155',
      icon: Building2
    }
  ];

  const utilizationData = [
    { name: 'Released', value: stats.released, color: '#2f6fdc' },
    { name: 'Utilized', value: stats.paid, color: '#7fd3f7' },
    { name: 'Unutilized', value: Math.max(stats.released - stats.paid, 0), color: '#f2b24c' }
  ];

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
            <div className="helper">Released: {formatCrore(stats.released)}</div>
            <div className="helper">Utilized: {formatCrore(stats.paid)}</div>
            <div className="helper">
              Unutilized: {formatCrore(Math.max(stats.released - stats.paid, 0))}
            </div>
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="helper">
                    Loading alerts...
                  </td>
                </tr>
              ) : null}
              {error ? (
                <tr>
                  <td colSpan="6" className="helper">
                    {error}
                  </td>
                </tr>
              ) : null}
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
