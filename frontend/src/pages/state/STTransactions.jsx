import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function STTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/state/transactions')
      .then((response) => {
        if (!mounted) return;
        setTransactions(response?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load transactions.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card title="State Transactions">
      <table className="table">
        <thead>
          <tr>
            <th>TXN ID</th>
            <th>District</th>
            <th>Scheme</th>
            <th>Amount (Cr)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="helper">Loading transactions...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="5" className="helper">{error}</td>
            </tr>
          ) : null}
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>{tx.transactionId}</td>
              <td>{tx.districtCode || tx.toCode || '-'}</td>
              <td>{tx.schemeName || tx.schemeId || '-'}</td>
              <td>{formatCrore(tx.amountCrore)}</td>
              <td>
                <Badge
                  tone={tx.isFlagged ? 'critical' : tx.status === 'confirmed' ? 'low' : 'medium'}
                  label={tx.isFlagged ? 'FLAGGED' : String(tx.status || '-').toUpperCase()}
                />
              </td>
            </tr>
          ))}
          {!loading && !error && !transactions.length ? (
            <tr>
              <td colSpan="5" className="helper">No transactions found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
