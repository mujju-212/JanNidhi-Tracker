import { useEffect, useState } from 'react';
import { Banknote, Send, Wallet, Map, ShieldAlert } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function STDashboard() {
  const [dashboard, setDashboard] = useState({ received: 0, released: 0, flags: 0 });
  const [transactions, setTransactions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiGet('/api/state/dashboard'),
      apiGet('/api/state/transactions'),
      apiGet('/api/state/district/all')
    ])
      .then(([dashboardResponse, txResponse, districtResponse]) => {
        if (!mounted) return;
        setDashboard(dashboardResponse?.data || { received: 0, released: 0, flags: 0 });
        setTransactions(txResponse?.data || []);
        setDistricts(districtResponse?.data || []);
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

  const stats = [
    {
      title: 'Received from Ministries',
      value: formatCrore(dashboard.received),
      sub: 'Confirmed transfers',
      icon: Banknote,
      accent: '#0f4aa7'
    },
    {
      title: 'Released to Districts',
      value: formatCrore(dashboard.released),
      sub: 'Confirmed transfers',
      icon: Send,
      accent: '#16b6a4'
    },
    {
      title: 'Remaining Balance',
      value: formatCrore(Number(dashboard.received || 0) - Number(dashboard.released || 0)),
      sub: 'Available',
      icon: Wallet,
      accent: '#1aa26f'
    },
    {
      title: 'Active Districts',
      value: String(districts.length),
      sub: 'Created district accounts',
      icon: Map,
      accent: '#334155'
    },
    {
      title: 'Active Flags',
      value: String(dashboard.flags || 0),
      sub: 'Open cases',
      icon: ShieldAlert,
      accent: '#e8515b'
    }
  ];

  const recent = transactions.slice(0, 6);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Card title="Recent Transactions">
        <table className="table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>Scheme</th>
              <th>Amount (Cr)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="helper">Loading transactions...</td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan="4" className="helper">{error}</td>
              </tr>
            ) : null}
            {recent.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.transactionId}</td>
                <td>{tx.schemeName || tx.schemeId || '-'}</td>
                <td>{formatCrore(tx.amountCrore)}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
            {!loading && !error && !recent.length ? (
              <tr>
                <td colSpan="4" className="helper">No recent transactions found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <Card title="District-wise Fund Map">
        <div className="helper">Map view will appear here (placeholder).</div>
      </Card>
    </div>
  );
}
