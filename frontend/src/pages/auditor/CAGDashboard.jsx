import { useEffect, useState } from 'react';
import { Banknote, AlertTriangle, ShieldCheck, Bell, Activity } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

const roleLabelMap = {
  super_admin: '🏦 Centre',
  ministry_admin: '🏛️ Ministry',
  state_admin: '🗺️ State',
  district_admin: '📍 District'
};

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
        setFlags((flagRes?.data || []).slice(0, 8));
        setFeed((feedRes?.data || []).slice(0, 10));
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
    { title: 'Leakage %', value: `${(leakage?.leakagePercent || 0).toFixed(1)}%`, sub: `₹${(leakage?.unaccounted || 0).toFixed(2)} Cr unaccounted`, icon: Bell, accent: '#f59e0b' },
    { title: 'To Beneficiaries', value: `₹${(leakage?.toBeneficiary || 0).toFixed(2)} Cr`, sub: 'Verified reach', icon: Activity, accent: '#16b6a4' }
  ];

  const confirmedTx = feed.filter(t => t.status === 'confirmed');
  const pendingTx = feed.filter(t => t.status === 'pending');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Fund Flow Summary */}
      {leakage && (
        <Card title="Fund Flow Summary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(15,74,167,0.04)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>To Districts</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>₹{(leakage.toDistricts || 0).toFixed(2)} Cr</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(22,182,164,0.04)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>To Beneficiaries</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#16b6a4' }}>₹{(leakage.toBeneficiary || 0).toFixed(2)} Cr</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>Unaccounted</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>₹{(leakage.unaccounted || 0).toFixed(2)} Cr</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: leakage.leakagePercent > 10 ? 'rgba(220,38,38,0.04)' : 'rgba(22,163,74,0.04)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>Leakage Rate</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: leakage.leakagePercent > 10 ? '#dc2626' : '#16a34a' }}>
                {(leakage.leakagePercent || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid two">
        {/* Recent Transactions */}
        <Card title="Recent Transactions" action={<span className="helper">{feed.length} latest</span>}>
          <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {feed.length === 0 && <div className="helper">No transactions yet</div>}
            {feed.map((tx) => (
              <div key={tx._id || tx.transactionId} style={{
                padding: '10px', borderRadius: '8px',
                background: tx.isFlagged ? 'rgba(220,38,38,0.03)' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${tx.isFlagged ? 'rgba(220,38,38,0.12)' : 'rgba(0,0,0,0.04)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}>{tx.transactionId}</div>
                  <Badge
                    tone={tx.isFlagged ? 'critical' : tx.status === 'confirmed' ? 'low' : 'medium'}
                    label={tx.isFlagged ? '🚩 FLAGGED' : tx.status?.toUpperCase() || 'OK'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                  <div>
                    <span style={{ opacity: 0.5 }}>From: </span>
                    {roleLabelMap[tx.fromRole] || tx.fromRole} <span style={{ opacity: 0.6 }}>({tx.fromName || tx.fromCode})</span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.5 }}>To: </span>
                    {roleLabelMap[tx.toRole] || tx.toRole} <span style={{ opacity: 0.6 }}>({tx.toName || tx.toCode})</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>₹{tx.amountCrore} Cr</div>
                  <div style={{ fontSize: '11px' }}>{tx.schemeName || tx.schemeId}</div>
                </div>
                {tx.blockchainTxHash && tx.blockchainTxHash !== 'PENDING' && (
                  <div style={{ marginTop: '6px', fontSize: '10px', display: 'flex', gap: '12px', opacity: 0.7 }}>
                    <span>TX: <a href={`${ETHERSCAN}/tx/${tx.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#0f4aa7', fontFamily: 'monospace' }}>{tx.blockchainTxHash.slice(0, 16)}...</a></span>
                    <span>Block: <a href={`${ETHERSCAN}/block/${tx.blockNumber}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#0f4aa7' }}>#{tx.blockNumber}</a></span>
                  </div>
                )}
                <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px' }}>
                  {new Date(tx.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Flags */}
        <Card title={`Active Flags (${flags.length})`}>
          <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {flags.length === 0 && <div className="helper">✅ No active flags — system clean</div>}
            {flags.map((flag) => (
              <div key={flag._id || flag.flagId} style={{
                padding: '10px', borderRadius: '8px',
                background: flag.flagType === 'critical' ? 'rgba(220,38,38,0.04)' : 'rgba(245,158,11,0.04)',
                border: `1px solid ${flag.flagType === 'critical' ? 'rgba(220,38,38,0.12)' : 'rgba(245,158,11,0.12)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '11px', fontFamily: 'monospace' }}>{flag.flagId}</strong>
                  <Badge tone={flag.flagType} label={flag.flagType?.toUpperCase()} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{flag.flagCode}</div>
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{flag.flagReason?.slice(0, 100)}</div>
                <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '6px', display: 'flex', gap: '8px' }}>
                  <span>TXN: {flag.transactionId || '-'}</span>
                  <span>Ministry: {flag.ministryCode || '-'}</span>
                  <span>State: {flag.stateCode || '-'}</span>
                </div>
                {flag.blockchainTxHash && flag.blockchainTxHash !== 'PENDING' && (
                  <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>
                    Chain: <a href={`${ETHERSCAN}/tx/${flag.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#0f4aa7', fontFamily: 'monospace' }}>{flag.blockchainTxHash.slice(0, 16)}...</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
