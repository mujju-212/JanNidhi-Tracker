import { useEffect, useMemo, useState } from 'react';
import { Landmark, Send, Users, Flag, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import FundFlowSankey from '../../components/charts/FundFlowSankey.jsx';
import { apiGet } from '../../services/api.js';

const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

const palette = ['#2f6fdc', '#22c55e', '#f59e0b', '#ef4444', '#7c3aed', '#06b6d4'];

const monthKey = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key) => {
  const [year, month] = key.split('-');
  return `${month}/${year.slice(-2)}`;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d5e2f6',
        borderRadius: '10px',
        padding: '8px 10px',
        boxShadow: '0 8px 16px rgba(30, 75, 140, 0.15)'
      }}
    >
      <div style={{ fontSize: '12px', color: '#5b6b86', marginBottom: '4px' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ fontSize: '12px', color: entry.color }}>
          {entry.name}: {formatCrore(entry.value)}
        </div>
      ))}
    </div>
  );
};

export default function SADashboard() {
  const [stats, setStats] = useState({
    allocated: 0,
    released: 0,
    paid: 0,
    activeFlags: 0,
    ministries: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [flagRows, setFlagRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      apiGet('/api/public/stats'),
      apiGet('/api/superadmin/dashboard'),
      apiGet('/api/superadmin/transactions'),
      apiGet('/api/superadmin/flags')
    ])
      .then(([publicStats, adminStats, transactionsResponse, flagsResponse]) => {
        if (!mounted) return;
        const publicData = publicStats?.data || {};
        const adminData = adminStats?.data || {};
        const txItems = transactionsResponse?.data || [];
        const flags = flagsResponse?.data || [];

        setStats({
          allocated: publicData.allocated ?? adminData.allocated ?? 0,
          released: publicData.released ?? adminData.released ?? 0,
          paid: publicData.paidToBeneficiaries ?? 0,
          activeFlags: adminData.activeFlags ?? publicData.activeFlags ?? 0,
          ministries: adminData.ministries ?? 0
        });
        setTransactions(txItems);
        setFlagRows(flags);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load dashboard data.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const monthlyTrend = useMemo(() => {
    const bucket = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed') return;
      const key = monthKey(tx.createdAt);
      const entry = bucket.get(key) || { month: key, allocated: 0, released: 0 };
      if (tx.fromRole === 'super_admin') {
        entry.allocated += Number(tx.amountCrore || 0);
      } else {
        entry.released += Number(tx.amountCrore || 0);
      }
      bucket.set(key, entry);
    });

    const timeline = [];
    const now = new Date();
    for (let i = 7; i >= 0; i -= 1) {
      const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const existing = bucket.get(key) || { month: key, allocated: 0, released: 0 };
      timeline.push({ ...existing, label: monthLabel(key) });
    }
    return timeline;
  }, [transactions]);

  const ministryDistribution = useMemo(() => {
    const totals = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed' || tx.fromRole !== 'super_admin') return;
      const key = tx.toCode || tx.toName || 'Unknown';
      totals.set(key, (totals.get(key) || 0) + Number(tx.amountCrore || 0));
    });
    return [...totals.entries()]
      .map(([ministry, amount]) => ({ ministry, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [transactions]);

  const stateReleaseDistribution = useMemo(() => {
    const totals = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed' || tx.fromRole !== 'ministry_admin') return;
      const key = tx.stateCode || tx.toCode || 'NA';
      totals.set(key, (totals.get(key) || 0) + Number(tx.amountCrore || 0));
    });
    return [...totals.entries()]
      .map(([state, released]) => ({ state, released }))
      .sort((a, b) => b.released - a.released)
      .slice(0, 10);
  }, [transactions]);

  const flagSeverityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, info: 0 };
    flagRows.forEach((flag) => {
      const key = flag.flagType || 'info';
      if (counts[key] === undefined) counts[key] = 0;
      counts[key] += 1;
    });
    return Object.entries(counts)
      .map(([name, value], index) => ({
        name,
        value,
        color: palette[index % palette.length]
      }))
      .filter((item) => item.value > 0);
  }, [flagRows]);

  const sankeyData = useMemo(() => {
    const top = ministryDistribution.slice(0, 6);
    const total = top.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const nodes = [{ name: 'Finance Ministry' }, ...top.map((item) => ({ name: item.ministry }))];
    const links = top.map((item, index) => ({
      source: 0,
      target: index + 1,
      value: total > 0 ? Number(((Number(item.amount || 0) / total) * 100).toFixed(2)) : 0,
      actualAmount: Number(item.amount || 0),
      shareLabel: total > 0 ? `${((Number(item.amount || 0) / total) * 100).toFixed(1)}%` : '0%'
    }));
    return { nodes, links, total };
  }, [ministryDistribution]);

  const showSankey = sankeyData.links.length > 0;

  const criticalAlerts = useMemo(
    () =>
      flagRows
        .filter((item) => item.flagType === 'critical')
        .slice(0, 5)
        .map((flag) => ({
          id: flag.flagId,
          type: flag.flagCode || 'CRITICAL',
          reason: flag.flagReason || '-',
          severity: flag.flagType || 'critical',
          location: [flag.ministryCode, flag.stateCode, flag.districtCode].filter(Boolean).join(' / ') || '-',
          date: flag.createdAt ? new Date(flag.createdAt).toLocaleString() : '-'
        })),
    [flagRows]
  );

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

  return (
    <div className="grid" style={{ gap: '22px' }}>
      <div className="grid stats">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid two">
        <Card title="Fund Flow Sankey (Finance to Ministries)" action={<span className="helper">Top ministries</span>}>
          {showSankey ? (
            <div className="sa-chart-wrap">
              <FundFlowSankey data={sankeyData} totalAllocation={sankeyData.total} />
            </div>
          ) : (
            <div className="sa-mini-flow">
              {(ministryDistribution.slice(0, 3) || []).map((item) => (
                <div key={item.ministry} className="sa-mini-flow-item">
                  <div>
                    <strong>{item.ministry}</strong>
                    <div className="helper">{formatCrore(item.amount)}</div>
                  </div>
                  <div className="progress">
                    <span style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
              {!ministryDistribution.length ? (
                <div className="helper">No allocation data yet for Sankey view.</div>
              ) : null}
            </div>
          )}
        </Card>
        <Card title="Fund Movement Trend (Monthly)" action={<span className="helper">Last 8 months</span>}>
          <div className="sa-chart-wrap" style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="allocatedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f6fdc" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#2f6fdc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="releasedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stroke="#2f6fdc"
                  fillOpacity={1}
                  fill="url(#allocatedGradient)"
                  name="Allocated"
                />
                <Area
                  type="monotone"
                  dataKey="released"
                  stroke="#16a34a"
                  fillOpacity={1}
                  fill="url(#releasedGradient)"
                  name="Released"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Flag Severity Distribution" action={<span className="helper">Live</span>}>
          <div className="sa-chart-wrap" style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={flagSeverityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {flagSeverityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid bottom">
        <Card title="Top Ministries By Allocation" action={<span className="helper">Confirmed allocations</span>}>
          <div className="sa-chart-wrap" style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer>
              <BarChart data={ministryDistribution} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="ministry" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" fill="#2f6fdc" radius={[8, 8, 0, 0]} maxBarSize={58} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Critical Flags" action={<span className="helper">Last 5 critical</span>}>
          <div className="sa-alert-list">
            {loading ? <div className="helper">Loading alerts...</div> : null}
            {error ? <div className="helper">{error}</div> : null}
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="sa-alert-item">
                <div style={{ display: 'grid', gap: '4px' }}>
                  <strong>{alert.id}</strong>
                  <div className="helper">{alert.type}</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{alert.reason}</div>
                  <div className="helper">{alert.location}</div>
                  <div className="helper">{alert.date}</div>
                </div>
                <div style={{ display: 'grid', gap: '8px', justifyItems: 'end' }}>
                  <Badge tone={alert.severity} label={alert.severity.toUpperCase()} />
                  <Link className="btn secondary" to="/superadmin/flags">
                    View
                  </Link>
                </div>
              </div>
            ))}
            {!loading && !error && criticalAlerts.length === 0 ? (
              <div className="helper">No critical flags right now.</div>
            ) : null}
          </div>
        </Card>
      </div>

      <Card title="State-wise Downstream Release" action={<span className="helper">From ministries to states</span>}>
        <div className="sa-chart-wrap" style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <BarChart data={stateReleaseDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="state" width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="released" fill="#16a34a" radius={[0, 8, 8, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Quick Actions">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link className="btn" to="/superadmin/create-ministry">
            Create Ministry Account
          </Link>
          <Link className="btn secondary" to="/superadmin/allocate-budget">
            Allocate Budget
          </Link>
          <Link className="btn secondary" to="/superadmin/transactions">
            View All Transactions
          </Link>
        </div>
      </Card>
    </div>
  );
}
