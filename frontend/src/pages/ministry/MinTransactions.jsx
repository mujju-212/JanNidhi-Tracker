import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';
const formatCrore = (value) => `₹${Number(value || 0).toFixed(2)} Cr`;

export default function MinTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/ministry/transactions')
      .then((res) => { if (mounted) setTransactions(res?.data || []); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <Card title="Ministry Transactions">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>State</th>
              <th>Scheme</th>
              <th>Amount</th>
              <th>Blockchain TX</th>
              <th>Block</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="8" className="helper">Loading transactions...</td></tr>}
            {error && <tr><td colSpan="8" className="alert">{error}</td></tr>}
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{tx.transactionId}</td>
                <td>{tx.toCode || '-'}</td>
                <td style={{ fontSize: '12px' }}>{tx.schemeName || tx.schemeId || '-'}</td>
                <td style={{ fontWeight: 600 }}>{formatCrore(tx.amountCrore)}</td>
                <td style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                  {tx.blockchainTxHash && tx.blockchainTxHash !== 'PENDING' ? (
                    <a href={`${ETHERSCAN}/tx/${tx.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#0f4aa7', textDecoration: 'underline' }}>
                      {tx.blockchainTxHash.slice(0, 14)}...
                    </a>
                  ) : <Badge tone="medium" label="PENDING" />}
                </td>
                <td>
                  {tx.blockNumber ? (
                    <a href={`${ETHERSCAN}/block/${tx.blockNumber}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#0f4aa7', fontSize: '12px' }}>#{tx.blockNumber}</a>
                  ) : '-'}
                </td>
                <td>
                  <Badge
                    tone={tx.isFlagged ? 'critical' : tx.status === 'confirmed' ? 'low' : 'medium'}
                    label={tx.isFlagged ? 'FLAGGED' : String(tx.status || '-').toUpperCase()}
                  />
                </td>
                <td style={{ fontSize: '11px' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {!loading && !error && !transactions.length && (
              <tr><td colSpan="8" className="helper">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
