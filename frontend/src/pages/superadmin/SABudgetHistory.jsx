import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

export default function SABudgetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chainVerify, setChainVerify] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const detailsRef = useRef(null);
  const [filters, setFilters] = useState({
    ministry: 'all', flowType: 'all', status: 'all', minAmount: '', maxAmount: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/superadmin/transactions')
      .then((res) => {
        if (!mounted) return;
        const items = (res?.data || []).map((tx) => ({
          id: tx.transactionId, from: tx.fromName || tx.fromRole || '-', fromCode: tx.fromCode || '-',
          fromWallet: tx.fromWalletAddress || '-', to: tx.toName || tx.toRole || '-', toCode: tx.toCode || '-',
          toWallet: tx.toWalletAddress || '-', amount: tx.amountCrore ?? 0, scheme: tx.schemeName || '-',
          schemeId: tx.schemeId || '-', status: tx.status || '-', isFlagged: !!tx.isFlagged,
          txHash: tx.blockchainTxHash || 'N/A', blockNumber: tx.blockNumber ?? '-',
          date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-', createdAt: tx.createdAt,
          ministry: tx.ministryCode || '-', state: tx.stateCode || '-', district: tx.districtCode || '-',
          quarter: tx.quarter || '-', financialYear: tx.financialYear || '-'
        }));
        setTransactions(items);
        setSelected(items[0] || null);
      })
      .catch((err) => { if (mounted) { setError(err.message); setTransactions([]); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const ministryOptions = useMemo(() => [...new Set(transactions.map((t) => t.ministry).filter(Boolean))].sort(), [transactions]);

  const filtered = useMemo(() => transactions.filter((tx) => {
    if (filters.ministry !== 'all' && tx.ministry !== filters.ministry) return false;
    if (filters.flowType === 'allocations' && tx.fromCode !== 'FIN_MIN') return false;
    if (filters.flowType === 'downstream' && tx.fromCode === 'FIN_MIN') return false;
    if (filters.status !== 'all') {
      if (filters.status === 'flagged' && !tx.isFlagged) return false;
      if (filters.status !== 'flagged' && tx.status !== filters.status) return false;
    }
    if (filters.minAmount && Number(tx.amount) < Number(filters.minAmount)) return false;
    if (filters.maxAmount && Number(tx.amount) > Number(filters.maxAmount)) return false;
    return true;
  }), [transactions, filters]);

  const tone = (tx) => tx.isFlagged ? 'critical' : tx.status === 'confirmed' ? 'low' : tx.status === 'pending' ? 'high' : 'medium';

  const handleView = (tx) => {
    setSelected(tx);
    setChainVerify(null);
    requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const verifyOnChain = async (txId) => {
    setVerifying(true);
    setChainVerify(null);
    try {
      const res = await apiGet(`/api/blockchain/transaction/${txId}`);
      setChainVerify(res?.data || null);
    } catch (err) {
      setChainVerify({ verified: false, reason: err.message });
    } finally { setVerifying(false); }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Transaction History">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '12px' }}>
          <div className="form-group">
            <label>Ministry</label>
            <select value={filters.ministry} onChange={(e) => setFilters((p) => ({ ...p, ministry: e.target.value }))}>
              <option value="all">All</option>
              {ministryOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Flow</label>
            <select value={filters.flowType} onChange={(e) => setFilters((p) => ({ ...p, flowType: e.target.value }))}>
              <option value="all">All</option>
              <option value="allocations">Centre → Ministry</option>
              <option value="downstream">Downstream</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>From → To</th>
                <th>Amount</th>
                <th>Scheme</th>
                <th>Status</th>
                <th>Blockchain TX</th>
                <th>Block</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="9" className="helper">Loading...</td></tr>}
              {error && <tr><td colSpan="9" className="alert">{error}</td></tr>}
              {filtered.map((tx) => (
                <tr key={tx.id} style={{ background: selected?.id === tx.id ? 'rgba(15, 74, 167, 0.05)' : undefined }}>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{tx.id}</td>
                  <td style={{ fontSize: '12px' }}>{tx.from}<br /><span style={{ opacity: 0.5 }}>→ {tx.to}</span></td>
                  <td style={{ fontWeight: 600 }}>₹{tx.amount} Cr</td>
                  <td style={{ fontSize: '12px' }}>{tx.scheme}</td>
                  <td><Badge tone={tone(tx)} label={tx.isFlagged ? 'FLAGGED' : tx.status.toUpperCase()} /></td>
                  <td style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                    {tx.txHash !== 'N/A' && tx.txHash !== 'PENDING' ? (
                      <a href={`${ETHERSCAN}/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4aa7' }}>
                        {tx.txHash.slice(0, 14)}...
                      </a>
                    ) : <Badge tone="medium" label={tx.txHash === 'PENDING' ? 'PENDING' : 'N/A'} />}
                  </td>
                  <td>
                    {tx.blockNumber !== '-' ? (
                      <a href={`${ETHERSCAN}/block/${tx.blockNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4aa7', fontSize: '12px' }}>#{tx.blockNumber}</a>
                    ) : '-'}
                  </td>
                  <td style={{ fontSize: '11px' }}>{tx.date}</td>
                  <td>
                    <button className="btn secondary" onClick={() => handleView(tx)} style={{ fontSize: '11px', padding: '4px 8px' }}>
                      {selected?.id === tx.id ? '👁' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !error && !filtered.length && <tr><td colSpan="9" className="helper">No transactions match filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Details + Blockchain Verify */}
      <Card title="🔗 Transaction Details + Blockchain Verification">
        <div ref={detailsRef} />
        {selected ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
              <div><span className="helper">Transaction ID</span><br /><strong style={{ fontFamily: 'monospace', fontSize: '11px' }}>{selected.id}</strong></div>
              <div><span className="helper">Amount</span><br /><strong>₹{selected.amount} Cr</strong></div>
              <div><span className="helper">Scheme</span><br />{selected.scheme} <span style={{ opacity: 0.5 }}>({selected.schemeId})</span></div>
              <div><span className="helper">From</span><br />{selected.from} ({selected.fromCode})<br /><span style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.5 }}>{selected.fromWallet}</span></div>
              <div><span className="helper">To</span><br />{selected.to} ({selected.toCode})<br /><span style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.5 }}>{selected.toWallet}</span></div>
              <div><span className="helper">Fund Trail</span><br /><strong>{selected.ministry} → {selected.state !== '-' ? selected.state : '...'} → {selected.district !== '-' ? selected.district : '...'}</strong></div>
              <div><span className="helper">Date</span><br />{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : selected.date}</div>
              <div><span className="helper">FY / Quarter</span><br />{selected.financialYear} / {selected.quarter}</div>
              <div>
                <span className="helper">Blockchain TX Hash</span><br />
                {selected.txHash !== 'N/A' && selected.txHash !== 'PENDING' ? (
                  <a href={`${ETHERSCAN}/tx/${selected.txHash}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#0f4aa7', textDecoration: 'underline', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selected.txHash}
                  </a>
                ) : <Badge tone="medium" label="PENDING" />}
              </div>
              <div>
                <span className="helper">Block #</span><br />
                {selected.blockNumber !== '-' ? (
                  <a href={`${ETHERSCAN}/block/${selected.blockNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4aa7' }}>#{selected.blockNumber}</a>
                ) : '-'}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(100,100,100,0.15)', paddingTop: '12px' }}>
              <button className="btn" onClick={() => verifyOnChain(selected.id)} disabled={verifying} style={{ background: '#0f4aa7' }}>
                {verifying ? '⏳ Reading from Sepolia Smart Contract...' : '🔗 Verify This Transaction on Blockchain'}
              </button>
            </div>

            {chainVerify && (
              <div style={{
                padding: '14px', borderRadius: '8px',
                background: chainVerify.verified ? 'rgba(22,163,74,0.08)' : chainVerify.chainData ? 'rgba(220,38,38,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${chainVerify.verified ? 'rgba(22,163,74,0.3)' : chainVerify.chainData ? 'rgba(220,38,38,0.3)' : 'rgba(245,158,11,0.3)'}`
              }}>
                {chainVerify.verified ? (
                  <>
                    <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>✅ VERIFIED — MongoDB data matches Blockchain</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                      <div>Chain Amount: <strong>₹{chainVerify.chainData?.amountCrore} Cr</strong></div>
                      <div>Chain Scheme: <strong>{chainVerify.chainData?.schemeId || 'BUDGET'}</strong></div>
                      <div>Chain From: <strong style={{ fontFamily: 'monospace', fontSize: '10px' }}>{chainVerify.chainData?.from}</strong></div>
                      <div>Chain To: <strong style={{ fontFamily: 'monospace', fontSize: '10px' }}>{chainVerify.chainData?.to}</strong></div>
                      <div>Chain Time: <strong>{chainVerify.chainData?.timestamp ? new Date(chainVerify.chainData.timestamp * 1000).toLocaleString() : '-'}</strong></div>
                      <div>Flagged: <strong>{chainVerify.chainData?.isFlagged ? '🚨 YES' : '✅ NO'}</strong></div>
                    </div>
                    {chainVerify.etherscanUrl && (
                      <a href={chainVerify.etherscanUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4aa7', fontSize: '12px', marginTop: '8px', display: 'inline-block' }}>
                        🔗 View on Etherscan →
                      </a>
                    )}
                  </>
                ) : chainVerify.chainData ? (
                  <>
                    <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>🚨 MISMATCH DETECTED — Data may be tampered!</div>
                    <div style={{ fontSize: '12px' }}>{(chainVerify.mismatches || []).map((m, i) => <div key={i}>• {m}</div>)}</div>
                  </>
                ) : (
                  <div style={{ fontWeight: 700, color: '#f59e0b' }}>⚠️ {chainVerify.reason || 'Not found on blockchain yet'}</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="helper">Select a transaction to view details and verify on blockchain.</div>
        )}
      </Card>
    </div>
  );
}
