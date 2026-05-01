import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function SABudgetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    ministry: 'all',
    flowType: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/superadmin/transactions')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        const mapped = items.map((tx) => ({
          id: tx.transactionId,
          from: tx.fromName || tx.fromRole || '-',
          fromCode: tx.fromCode || '-',
          fromWallet: tx.fromWalletAddress || '-',
          to: tx.toName || tx.toRole || '-',
          toCode: tx.toCode || '-',
          toWallet: tx.toWalletAddress || '-',
          amount: tx.amountCrore ?? 0,
          scheme: tx.schemeName || '-',
          status: tx.status || '-',
          isFlagged: !!tx.isFlagged,
          txHash: tx.blockchainTxHash || 'N/A',
          blockNumber: tx.blockNumber ?? '-',
          hash: tx.blockchainTxHash || 'N/A',
          date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-',
          createdAt: tx.createdAt,
          ministry: tx.ministryCode || '-',
          state: tx.stateCode || '-',
          district: tx.districtCode || '-',
          quarter: tx.quarter || '-',
          financialYear: tx.financialYear || '-'
        }));
        setTransactions(mapped);
        setSelected(mapped[0] || null);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load transactions.');
        setTransactions([]);
        setSelected(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const ministryOptions = useMemo(() => {
    const values = [...new Set(transactions.map((tx) => tx.ministry).filter(Boolean))];
    return values.sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
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
    });
  }, [transactions, filters]);

  const statusTone = (tx) => {
    if (tx.isFlagged) return 'critical';
    if (tx.status === 'confirmed') return 'low';
    if (tx.status === 'pending') return 'high';
    return 'medium';
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Transaction History">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '12px'
          }}
        >
          <div className="form-group">
            <label>Ministry</label>
            <select
              value={filters.ministry}
              onChange={(event) => setFilters((prev) => ({ ...prev, ministry: event.target.value }))}
            >
              <option value="all">All</option>
              {ministryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Flow</label>
            <select
              value={filters.flowType}
              onChange={(event) => setFilters((prev) => ({ ...prev, flowType: event.target.value }))}
            >
              <option value="all">All</option>
              <option value="allocations">Centre to Ministry</option>
              <option value="downstream">Ministry/State/District</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="all">All</option>
              <option value="confirmed">confirmed</option>
              <option value="pending">pending</option>
              <option value="failed">failed</option>
              <option value="blocked">blocked</option>
              <option value="flagged">flagged</option>
            </select>
          </div>
          <div className="form-group">
            <label>Min Amount (Cr)</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(event) => setFilters((prev) => ({ ...prev, minAmount: event.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Max Amount (Cr)</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(event) => setFilters((prev) => ({ ...prev, maxAmount: event.target.value }))}
              placeholder="99999"
            />
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>From</th>
              <th>To</th>
              <th>Amount (Cr)</th>
              <th>Scheme</th>
              <th>Status</th>
              <th>TX Hash</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="helper">
                  Loading transactions...
                </td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan="9" className="helper">
                  {error}
                </td>
              </tr>
            ) : null}
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.from}</td>
                <td>{tx.to}</td>
                <td>Rs {tx.amount}</td>
                <td>{tx.scheme}</td>
                <td>
                  <Badge tone={statusTone(tx)} label={tx.isFlagged ? 'FLAGGED' : tx.status.toUpperCase()} />
                </td>
                <td style={{ fontFamily: 'monospace' }}>{tx.txHash}</td>
                <td>{tx.date}</td>
                <td>
                  <button className="btn secondary" onClick={() => setSelected(tx)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !error && filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="helper">
                  No transactions found for selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <Card title="Transaction Details">
        {selected ? (
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Transaction ID: {selected.id}</div>
            <div>Status: {selected.status}</div>
            <div>Block Number: {selected.blockNumber}</div>
            <div>Block Hash: {selected.hash}</div>
            <div>From Wallet: {selected.fromWallet}</div>
            <div>To Wallet: {selected.toWallet}</div>
            <div>Amount: Rs {selected.amount} Cr</div>
            <div>Scheme: {selected.scheme}</div>
            <div>From / To Codes: {selected.fromCode} → {selected.toCode}</div>
            <div>Timestamp: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : selected.date}</div>
            <div>Downstream Trail: {selected.ministry} → {selected.state} → {selected.district}</div>
            <div>Financial Year / Quarter: {selected.financialYear} / {selected.quarter}</div>
          </div>
        ) : (
          <div className="helper">Select a transaction to view block details.</div>
        )}
      </Card>
    </div>
  );
}
