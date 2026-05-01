import { useEffect, useMemo, useState } from 'react';
import { Banknote, Send, Wallet, Layers, ShieldAlert } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function MinDashboard() {
  const [dashboard, setDashboard] = useState({ received: 0, released: 0, schemes: 0, flags: 0 });
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiGet('/api/ministry/dashboard'),
      apiGet('/api/ministry/transactions'),
      apiGet('/api/ministry/flags'),
      apiGet('/api/ministry/scheme/all')
    ])
      .then(([dashboardResponse, txResponse, flagResponse, schemeResponse]) => {
        if (!mounted) return;
        setDashboard(dashboardResponse?.data || { received: 0, released: 0, schemes: 0, flags: 0 });
        setTransactions(txResponse?.data || []);
        setFlags(flagResponse?.data || []);
        setSchemes(schemeResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load ministry dashboard.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const releasedByScheme = useMemo(() => {
    const byScheme = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed' || tx.fromRole !== 'ministry_admin') return;
      const key = tx.schemeId || tx.schemeName || 'UNKNOWN';
      const prev = byScheme.get(key) || {
        key,
        name: tx.schemeName || tx.schemeId || 'Unknown Scheme',
        released: 0
      };
      prev.released += Number(tx.amountCrore || 0);
      byScheme.set(key, prev);
    });

    return schemes
      .map((scheme) => {
        const released = byScheme.get(scheme.schemeId)?.released || 0;
        const allocated = Number(scheme.totalBudgetCrore || 0);
        const progress = allocated > 0 ? Math.min(100, Math.round((released / allocated) * 100)) : 0;
        return {
          name: scheme.schemeName,
          allocated,
          released,
          progress
        };
      })
      .sort((a, b) => b.released - a.released)
      .slice(0, 6);
  }, [transactions, schemes]);

  const statCards = [
    {
      title: 'Received From Centre',
      value: formatCrore(dashboard.received),
      sub: 'Confirmed receipts',
      icon: Banknote,
      accent: '#0f4aa7'
    },
    {
      title: 'Released To States',
      value: formatCrore(dashboard.released),
      sub: 'Confirmed disbursement',
      icon: Send,
      accent: '#16b6a4'
    },
    {
      title: 'Remaining Balance',
      value: formatCrore(Number(dashboard.received || 0) - Number(dashboard.released || 0)),
      sub: 'Available now',
      icon: Wallet,
      accent: '#1aa26f'
    },
    {
      title: 'Active Schemes',
      value: String(dashboard.schemes || 0),
      sub: 'Configured by ministry',
      icon: Layers,
      accent: '#334155'
    },
    {
      title: 'Open Flags',
      value: String(dashboard.flags || 0),
      sub: 'Requires action',
      icon: ShieldAlert,
      accent: '#e8515b'
    }
  ];

  const recentFlags = flags.slice(0, 5).map((flag) => ({
    id: flag.flagId || flag._id,
    issue: flag.flagReason || 'No reason available',
    status: flag.flagType || 'medium'
  }));

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {statCards.map((card) => (
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
            {loading ? (
              <tr>
                <td colSpan="4" className="helper">Loading schemes...</td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan="4" className="helper">{error}</td>
              </tr>
            ) : null}
            {releasedByScheme.map((scheme) => (
              <tr key={scheme.name}>
                <td>{scheme.name}</td>
                <td>{formatCrore(scheme.allocated)}</td>
                <td>{formatCrore(scheme.released)}</td>
                <td>
                  <div className="progress">
                    <span style={{ width: `${scheme.progress}%` }} />
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !error && releasedByScheme.length === 0 ? (
              <tr>
                <td colSpan="4" className="helper">No scheme release data yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <Card title="Recent Flags">
        <div style={{ display: 'grid', gap: '10px' }}>
          {recentFlags.map((flag) => (
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
