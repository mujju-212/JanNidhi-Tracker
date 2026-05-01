import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function MinViewBudget() {
  const [allocations, setAllocations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiGet('/api/ministry/budget'),
      apiGet('/api/ministry/transactions'),
      apiGet('/api/ministry/scheme/all')
    ])
      .then(([budgetResponse, txResponse, schemeResponse]) => {
        if (!mounted) return;
        setAllocations(budgetResponse?.data || []);
        setTransactions(txResponse?.data || []);
        setSchemes(schemeResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load budget view.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalAllocated = allocations.reduce((sum, item) => sum + Number(item.amountCrore || 0), 0);
    const totalReleased = transactions
      .filter((tx) => tx.status === 'confirmed' && tx.fromRole === 'ministry_admin')
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);
    return {
      totalAllocated,
      totalReleased,
      pendingRelease: totalAllocated - totalReleased,
      activeSchemes: schemes.filter((item) => item.status === 'active').length
    };
  }, [allocations, transactions, schemes]);

  const allocationRows = useMemo(() => {
    return allocations.map((item) => ({
      id: item.transactionId || item._id,
      scheme: item.schemeName || 'Budget Allocation',
      amount: Number(item.amountCrore || 0),
      released: 0,
      balance: Number(item.amountCrore || 0),
      status: item.status || 'confirmed',
      hash: item.blockchainTxHash || '-',
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'
    }));
  }, [allocations]);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Budget Summary">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          <div>
            <div className="helper">Total Allocated</div>
            <div style={{ fontWeight: 600 }}>{formatCrore(summary.totalAllocated)}</div>
          </div>
          <div>
            <div className="helper">Released to States</div>
            <div style={{ fontWeight: 600 }}>{formatCrore(summary.totalReleased)}</div>
          </div>
          <div>
            <div className="helper">Pending Release</div>
            <div style={{ fontWeight: 600 }}>{formatCrore(summary.pendingRelease)}</div>
          </div>
          <div>
            <div className="helper">Active Schemes</div>
            <div style={{ fontWeight: 600 }}>{summary.activeSchemes}</div>
          </div>
        </div>
      </Card>

      <Card title="Allocations from Finance Ministry">
        <table className="table">
          <thead>
            <tr>
              <th>Allocation ID</th>
              <th>Scheme</th>
              <th>Amount (Cr)</th>
              <th>Released</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Block Hash</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="helper">Loading allocations...</td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan="8" className="helper">{error}</td>
              </tr>
            ) : null}
            {allocationRows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.scheme}</td>
                <td>{formatCrore(item.amount)}</td>
                <td>{formatCrore(item.released)}</td>
                <td>{formatCrore(item.balance)}</td>
                <td>
                  <Badge tone={item.status === 'confirmed' ? 'low' : 'medium'} label={item.status.toUpperCase()} />
                </td>
                <td>{item.hash}</td>
                <td>{item.date}</td>
              </tr>
            ))}
            {!loading && !error && allocationRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="helper">No allocations found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
