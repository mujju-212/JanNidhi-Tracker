import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function SABudgetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
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
          to: tx.toName || tx.toRole || '-',
          amount: tx.amountCrore ?? 0,
          scheme: tx.schemeName || '-',
          status: tx.status || '-',
          hash: tx.blockchainTxHash || 'N/A',
          date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'
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
            <select>
              <option>All</option>
              <option>MoHFW</option>
              <option>MoEdu</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select>
              <option>All</option>
              <option>confirmed</option>
              <option>flagged</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <input placeholder="Apr 2024 - Now" />
          </div>
          <div className="form-group">
            <label>Amount Range</label>
            <input placeholder="0 - 99999" />
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
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="helper">
                  Loading transactions...
                </td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan="8" className="helper">
                  {error}
                </td>
              </tr>
            ) : null}
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.from}</td>
                <td>{tx.to}</td>
                <td>Rs {tx.amount}</td>
                <td>{tx.scheme}</td>
                <td>{tx.status}</td>
                <td>{tx.date}</td>
                <td>
                  <button className="btn secondary" onClick={() => setSelected(tx)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Block Details">
        {selected ? (
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Transaction ID: {selected.id}</div>
            <div>Block Hash: {selected.hash}</div>
            <div>From Wallet: -</div>
            <div>To Wallet: -</div>
            <div>Amount: Rs {selected.amount} Cr</div>
            <div>Timestamp: {selected.date}</div>
          </div>
        ) : (
          <div className="helper">Select a transaction to view block details.</div>
        )}
      </Card>
    </div>
  );
}
