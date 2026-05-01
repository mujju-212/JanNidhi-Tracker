import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function CAGLiveFeed() {
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ schemeId: '', stateCode: '', status: '' });

  const loadData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.schemeId) params.set('schemeId', filter.schemeId);
      if (filter.stateCode) params.set('stateCode', filter.stateCode);
      if (filter.status) params.set('status', filter.status);

      const [txRes, flagRes] = await Promise.all([
        apiGet(`/api/auditor/transactions?${params.toString()}`),
        apiGet('/api/auditor/flags?status=active')
      ]);
      setTransactions(txRes?.data || []);
      setFlags((flagRes?.data || []).slice(0, 10));
    } catch (err) {
      console.error('Feed load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleFilter = () => { setLoading(true); loadData(); };

  if (loading) return <div className="loading">Loading live feed...</div>;

  return (
    <div className="grid" style={{ gap: '20px', gridTemplateColumns: '2fr 1fr' }}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <Card title="Filters">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Scheme ID" value={filter.schemeId}
              onChange={(e) => setFilter(p => ({ ...p, schemeId: e.target.value }))} />
            <input placeholder="State Code" value={filter.stateCode}
              onChange={(e) => setFilter(p => ({ ...p, stateCode: e.target.value }))} />
            <select value={filter.status} onChange={(e) => setFilter(p => ({ ...p, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
            </select>
            <button className="btn secondary" onClick={handleFilter}>Apply</button>
          </div>
        </Card>

        <Card title={`Live Transactions (${transactions.length})`}>
          <div style={{ display: 'grid', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
            {transactions.length === 0 && <div className="helper">No transactions match filters</div>}
            {transactions.map((tx) => (
              <div key={tx._id} className="stat-card">
                <div className="stat-meta">
                  <strong>{tx.transactionId}</strong>
                  <span>{tx.fromName || tx.fromCode} → {tx.toName || tx.toCode}</span>
                  <span>Rs {tx.amountCrore} Cr · {tx.schemeName || tx.schemeId}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(tx.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <Badge tone={tx.isFlagged ? 'critical' : 'low'} label={tx.isFlagged ? 'FLAGGED' : tx.status?.toUpperCase()} />
                  {tx.blockchainTxHash && tx.blockchainTxHash !== 'PENDING' && (
                    <span style={{ fontSize: '10px', opacity: 0.5 }}>Block #{tx.blockNumber}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Active Flags">
        <div style={{ display: 'grid', gap: '10px' }}>
          {flags.length === 0 && <div className="helper">No active flags</div>}
          {flags.map((flag) => (
            <div key={flag._id} className="stat-card">
              <div className="stat-meta">
                <strong>{flag.flagId}</strong>
                <span>{flag.flagCode}</span>
                <span style={{ fontSize: '12px' }}>{flag.flagReason?.slice(0, 50)}</span>
              </div>
              <Badge tone={flag.flagType} label={flag.flagType?.toUpperCase()} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
