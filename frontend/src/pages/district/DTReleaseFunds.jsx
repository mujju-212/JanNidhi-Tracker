import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function DTReleaseFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const total = funds.reduce((s, f) => s + Number(f.amountCrore || 0), 0);

  useEffect(() => {
    apiGet('/api/district/funds')
      .then((res) => setFunds(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Card title={`District Fund Summary (Total Received: Rs ${total.toFixed(2)} Cr)`}>
      <div className="helper" style={{ marginBottom: '12px' }}>
        District admins receive funds from state. Payments to beneficiaries are done via the Trigger Payment module.
      </div>
      <table className="table">
        <thead><tr><th>TXN ID</th><th>From</th><th>Scheme</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {funds.length === 0 && <tr><td colSpan={5} className="helper">No funds received</td></tr>}
          {funds.map((f) => (
            <tr key={f._id}>
              <td style={{ fontSize: '12px' }}>{f.transactionId}</td>
              <td>{f.fromName || f.fromCode}</td>
              <td>{f.schemeName || f.schemeId}</td>
              <td>Rs {f.amountCrore} Cr</td>
              <td style={{ color: f.status === 'confirmed' ? '#16a34a' : '#f59e0b' }}>{f.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
