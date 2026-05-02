import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, ShieldCheck, Users, Globe2 } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { apiGet } from '../../services/api.js';

export default function PublicHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    Promise.all([
      apiGet('/api/public/stats'),
      apiGet('/api/public/schemes')
    ]).then(([sRes, scRes]) => {
      setStats(sRes?.data || {});
      setSchemes((scRes?.data || []).slice(0, 6));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading public data...</div>;

  const cards = [
    { title: 'Funds Allocated', value: `Rs ${Number(stats.allocated || 0).toFixed(2)} Cr`, sub: 'Central allocation', icon: Banknote, accent: '#0f4aa7' },
    { title: 'Funds Released', value: `Rs ${Number(stats.released || 0).toFixed(2)} Cr`, sub: 'Transferred downstream', icon: ShieldCheck, accent: '#16b6a4' },
    { title: 'Paid to Citizens', value: `Rs ${Number(stats.paidToBeneficiaries || 0).toFixed(2)} Cr`, sub: 'Successful payouts', icon: Users, accent: '#334155' },
    { title: 'Active Flags', value: String(stats.activeFlags || 0), sub: 'Open anomalies', icon: Globe2, accent: '#1aa26f' }
  ];

  const handleVerifyNavigation = () => {
    const search = txHash.trim() ? `?txHash=${encodeURIComponent(txHash.trim())}` : '';
    navigate(`/public/verify${search}`);
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>JanNidhi Tracker</h1>
        <p className="helper" style={{ fontSize: '15px' }}>India's Blockchain-Powered Public Fund Transparency Platform</p>
      </div>

      <div className="grid stats">
        {cards.map((c) => <StatCard key={c.title} {...c} />)}
      </div>

      <Card title="Active Government Schemes">
        <div style={{ display: 'grid', gap: '12px' }}>
          {schemes.map((s) => (
            <div key={s.schemeId} className="stat-card">
              <div className="stat-meta">
                <strong>{s.schemeName}</strong>
                <span>{s.ownerMinistryName} · Budget: Rs {s.totalBudgetCrore} Cr</span>
              </div>
              <Link className="btn secondary" to={`/public/schemes/${s.schemeId}`} style={{ fontSize: '12px' }}>View</Link>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Verify a Transaction">
        <div className="helper" style={{ marginBottom: '12px' }}>Enter a blockchain transaction hash to verify it on-chain</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder="0x..."
            style={{ flex: 1 }}
            id="txHash"
            value={txHash}
            onChange={(event) => setTxHash(event.target.value)}
          />
          <button className="btn secondary" type="button" onClick={handleVerifyNavigation} style={{ whiteSpace: 'nowrap' }}>
            Verify
          </button>
        </div>
      </Card>
    </div>
  );
}
