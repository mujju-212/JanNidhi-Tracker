import { useEffect, useState } from 'react';
import { Banknote, AlertTriangle, ShieldCheck, Bell, Activity } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function CAGDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [flags, setFlags] = useState([]);
  const [feed, setFeed] = useState([]);
  const [leakage, setLeakage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, flagRes, feedRes, leakRes] = await Promise.all([
          apiGet('/api/auditor/dashboard'),
          apiGet('/api/auditor/flags?status=active'),
          apiGet('/api/auditor/live-feed'),
          apiGet('/api/auditor/leakage')
        ]);
        setDashboard(dashRes?.data || {});
        setFlags((flagRes?.data || []).slice(0, 5));
        setFeed((feedRes?.data || []).slice(0, 6));
        setLeakage(leakRes?.data || {});
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading">Loading CAG Dashboard...</div>;

  const stats = [
    { title: 'Total Transactions', value: dashboard?.totalTransactions || 0, sub: 'All tracked', icon: Banknote, accent: '#0f4aa7' },
    { title: 'Active Flags', value: dashboard?.activeFlags || 0, sub: 'Open cases', icon: AlertTriangle, accent: '#e8515b' },
    { title: 'Total Flags', value: dashboard?.totalFlags || 0, sub: 'All time', icon: ShieldCheck, accent: '#334155' },
    { title: 'Leakage %', value: `${(leakage?.leakagePercent || 0).toFixed(1)}%`, sub: `${(leakage?.unaccounted || 0).toFixed(2)} Cr unaccounted`, icon: Bell, accent: '#f59e0b' },
    { title: 'To Beneficiaries', value: `${(leakage?.toBeneficiary || 0).toFixed(2)} Cr`, sub: 'Verified reach', icon: Activity, accent: '#16b6a4' }
  ];

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid two">
        <Card title="Live Transaction Feed" action={<span className="helper">{feed.length} latest</span>}>
          <div style={{ display: 'grid', gap: '10px' }}>
            {feed.length === 0 && <div className="helper">No transactions yet</div>}
            {feed.map((tx) => (
              <div key={tx._id || tx.transactionId} className="stat-card">
                <div className="stat-meta">
                  <strong>{tx.transactionId}</strong>
                  <span>{tx.fromName || tx.fromCode} → {tx.toName || tx.toCode}</span>
                  <span>Rs {tx.amountCrore} Cr</span>
                </div>
                <Badge
                  tone={tx.isFlagged ? 'critical' : 'low'}
                  label={tx.isFlagged ? 'FLAGGED' : tx.status?.toUpperCase() || 'OK'}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Active Flags">
          <div style={{ display: 'grid', gap: '10px' }}>
            {flags.length === 0 && <div className="helper">No active flags — system clean</div>}
            {flags.map((flag) => (
              <div key={flag._id || flag.flagId} className="stat-card">
                <div className="stat-meta">
                  <strong>{flag.flagId}</strong>
                  <span>{flag.flagReason?.slice(0, 60)}...</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {flag.ministryCode} · {flag.stateCode || '-'} · {flag.districtCode || '-'}
                  </span>
                </div>
                <Badge tone={flag.flagType} label={flag.flagType?.toUpperCase()} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
