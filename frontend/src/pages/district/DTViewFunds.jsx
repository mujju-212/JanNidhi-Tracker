import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function DTViewFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/funds')
      .then((res) => setFunds(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading funds...</div>;
  const total = funds.reduce((s, f) => s + Number(f.amountCrore || 0), 0);

  return (
    <Card title={`Received Funds (Total: Rs ${total.toFixed(2)} Cr)`}>
      <table className="table">
        <thead><tr><th>TXN ID</th><th>From</th><th>Scheme</th><th>Amount (Cr)</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {funds.length === 0 && <tr><td colSpan={6} className="helper">No funds received yet</td></tr>}
          {funds.map((f) => (
            <tr key={f._id}>
              <td style={{ fontSize: '12px' }}>{f.transactionId}</td>
              <td>{f.fromName || f.fromCode}</td>
              <td>{f.schemeName || f.schemeId}</td>
              <td>Rs {f.amountCrore} Cr</td>
              <td style={{ fontSize: '12px' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
              <td style={{ color: f.status === 'confirmed' ? '#16a34a' : '#f59e0b' }}>{f.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
