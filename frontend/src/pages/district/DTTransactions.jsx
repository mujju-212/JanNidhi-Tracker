import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

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
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>From → To</th>
              <th>Scheme</th>
              <th>Amount</th>
              <th>Blockchain TX</th>
              <th>Block</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && <tr><td colSpan={8} className="helper">No transactions</td></tr>}
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{tx.transactionId}</td>
                <td style={{ fontSize: '12px' }}>
                  {tx.fromName || tx.fromCode || '-'}
                  <br /><span style={{ opacity: 0.5 }}>→ {tx.toName || tx.toCode || '-'}</span>
                </td>
                <td style={{ fontSize: '12px' }}>{tx.schemeName || tx.schemeId || '-'}</td>
                <td style={{ fontWeight: 600 }}>₹{tx.amountCrore} Cr</td>
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
                <td><Badge tone={tx.status === 'confirmed' ? 'low' : 'medium'} label={String(tx.status || '-').toUpperCase()} /></td>
                <td style={{ fontSize: '11px' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
