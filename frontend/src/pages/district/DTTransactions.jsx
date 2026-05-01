import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function DTTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/funds')
      .then((res) => setTransactions(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <Card title={`District Transactions (${transactions.length})`}>
      <table className="table">
        <thead><tr><th>TXN ID</th><th>From</th><th>To</th><th>Scheme</th><th>Amount (Cr)</th><th>Status</th></tr></thead>
        <tbody>
          {transactions.length === 0 && <tr><td colSpan={6} className="helper">No transactions</td></tr>}
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td style={{ fontSize: '12px' }}>{tx.transactionId}</td>
              <td>{tx.fromName || tx.fromCode}</td>
              <td>{tx.toName || tx.toCode}</td>
              <td>{tx.schemeName || tx.schemeId}</td>
              <td>Rs {tx.amountCrore}</td>
              <td><Badge tone={tx.status === 'confirmed' ? 'low' : 'medium'} label={tx.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
