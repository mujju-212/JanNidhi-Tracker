import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

const roleLabelMap = {
  super_admin: '🏦 Centre',
  ministry_admin: '🏛️ Ministry',
  state_admin: '🗺️ State',
  district_admin: '📍 District'
};

export default function CAGLiveFeed() {
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ schemeId: '', status: '' });
  const [expanded, setExpanded] = useState(null);

  const loadData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.schemeId) params.set('schemeId', filter.schemeId);
      if (filter.status) params.set('status', filter.status);

      const [txRes, flagRes] = await Promise.all([
        apiGet(`/api/auditor/transactions?${params.toString()}`),
        apiGet('/api/auditor/flags?status=active')
      ]);
      setTransactions(txRes?.data || []);
      setFlags((flagRes?.data || []).slice(0, 15));
    } catch (err) {
      console.error('Feed load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleFilter = () => { setLoading(true); loadData(); };

  if (loading) return <div className="loading">Loading live feed...</div>;

  const confirmed = transactions.filter(t => t.status === 'confirmed').length;
  const pending = transactions.filter(t => t.status === 'pending').length;
  const flagged = transactions.filter(t => t.isFlagged).length;
  const totalAmount = transactions.reduce((s, t) => s + Number(t.amountCrore || 0), 0);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      {/* Summary Stats */}
      <div className="grid stats">
        <div className="stat-card">
          <div className="stat-meta"><span>Total Transactions</span><strong style={{ fontSize: '22px' }}>{transactions.length}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span>Confirmed (On-Chain)</span><strong style={{ fontSize: '22px', color: '#16a34a' }}>{confirmed}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span>Pending</span><strong style={{ fontSize: '22px', color: '#f59e0b' }}>{pending}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span>Flagged</span><strong style={{ fontSize: '22px', color: '#dc2626' }}>{flagged}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span>Total Volume</span><strong style={{ fontSize: '22px' }}>₹{totalAmount.toFixed(2)} Cr</strong></div>
        </div>
      </div>

      {/* Filters */}
      <Card title="Filters">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Scheme ID</label>
            <input placeholder="e.g. PM-KISAN-2024" value={filter.schemeId}
              onChange={(e) => setFilter(p => ({ ...p, schemeId: e.target.value }))} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Status</label>
            <select value={filter.status} onChange={(e) => setFilter(p => ({ ...p, status: e.target.value }))}>
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button className="btn secondary" onClick={handleFilter}>Apply</button>
        </div>
      </Card>

      {/* Main Layout */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Transaction Table */}
        <Card title={`All Transactions (${transactions.length})`}>
          <div className="table-wrap" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>TXN ID</th>
                  <th>Flow</th>
                  <th>Amount</th>
                  <th>Scheme</th>
                  <th>Blockchain</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && <tr><td colSpan={7} className="helper">No transactions found</td></tr>}
                {transactions.map((tx) => (
                  <>
                    <tr key={tx._id} onClick={() => setExpanded(expanded === tx._id ? null : tx._id)}
                      style={{ cursor: 'pointer', background: expanded === tx._id ? 'rgba(15,74,167,0.04)' : undefined }}>
                      <td style={{ fontSize: '10px', fontFamily: 'monospace', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.transactionId}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <span>{roleLabelMap[tx.fromRole] || tx.fromRole}</span>
                        <br /><span style={{ opacity: 0.5 }}>→ {roleLabelMap[tx.toRole] || tx.toRole}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{tx.amountCrore} Cr</td>
                      <td style={{ fontSize: '11px' }}>{tx.schemeName || tx.schemeId}</td>
                      <td style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                        {tx.blockchainTxHash && tx.blockchainTxHash !== 'PENDING' ? (
                          <a href={`${ETHERSCAN}/tx/${tx.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#0f4aa7', textDecoration: 'underline' }}>
                            {tx.blockchainTxHash.slice(0, 12)}...
                          </a>
                        ) : <Badge tone="medium" label="PENDING" />}
                      </td>
                      <td>
                        <Badge
                          tone={tx.isFlagged ? 'critical' : tx.status === 'confirmed' ? 'low' : 'medium'}
                          label={tx.isFlagged ? '🚩 FLAGGED' : tx.status?.toUpperCase()}
                        />
                      </td>
                      <td style={{ fontSize: '11px' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                    {expanded === tx._id && (
                      <tr key={`${tx._id}-detail`}>
                        <td colSpan={7} style={{ background: 'rgba(15,74,167,0.02)', padding: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                            <div><strong>From:</strong> {tx.fromName || tx.fromCode || '-'}</div>
                            <div><strong>To:</strong> {tx.toName || tx.toCode || '-'}</div>
                            <div><strong>From Wallet:</strong> <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{tx.fromWalletAddress || '-'}</span></div>
                            <div><strong>To Wallet:</strong> <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{tx.toWalletAddress || '-'}</span></div>
                            <div><strong>Ministry:</strong> {tx.ministryCode || '-'}</div>
                            <div><strong>Financial Year:</strong> {tx.financialYear || '-'}</div>
                            {tx.blockchainTxHash && tx.blockchainTxHash !== 'PENDING' && (
                              <>
                                <div><strong>TX Hash:</strong> <a href={`${ETHERSCAN}/tx/${tx.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                                  style={{ color: '#0f4aa7', fontFamily: 'monospace', fontSize: '10px', wordBreak: 'break-all' }}>{tx.blockchainTxHash}</a></div>
                                <div><strong>Block:</strong> <a href={`${ETHERSCAN}/block/${tx.blockNumber}`} target="_blank" rel="noopener noreferrer"
                                  style={{ color: '#0f4aa7' }}>#{tx.blockNumber}</a></div>
                              </>
                            )}
                            <div><strong>Flagged:</strong> {tx.isFlagged ? '🚩 Yes' : '✅ No'}</div>
                            <div><strong>Created:</strong> {new Date(tx.createdAt).toLocaleString()}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Active Flags Panel */}
        <Card title={`Active Flags (${flags.length})`}>
          <div style={{ display: 'grid', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
            {flags.length === 0 && <div className="helper">✅ No active flags — system clean</div>}
            {flags.map((flag) => (
              <div key={flag._id} style={{
                padding: '10px', borderRadius: '8px',
                background: flag.flagType === 'critical' ? 'rgba(220,38,38,0.05)' : 'rgba(245,158,11,0.05)',
                border: `1px solid ${flag.flagType === 'critical' ? 'rgba(220,38,38,0.15)' : 'rgba(245,158,11,0.15)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>{flag.flagId}</strong>
                  <Badge tone={flag.flagType} label={flag.flagType?.toUpperCase()} />
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{flag.flagCode}</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>{flag.flagReason?.slice(0, 80)}</div>
                <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>
                  TXN: {flag.transactionId || '-'} · {flag.ministryCode || '-'} · {flag.stateCode || '-'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
