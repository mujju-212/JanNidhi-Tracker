import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function DTHeldPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/payments')
      .then((res) => setPayments((res?.data || []).filter(p => p.status === 'held')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading held payments...</div>;

  return (
    <Card title={`Held Payments (${payments.length})`}>
      <table className="table">
        <thead><tr><th>Payment ID</th><th>Beneficiary</th><th>Scheme</th><th>Amount</th><th>Reason</th></tr></thead>
        <tbody>
          {payments.length === 0 && <tr><td colSpan={5} className="helper">No held payments — all clear!</td></tr>}
          {payments.map((p) => (
            <tr key={p._id}>
              <td style={{ fontSize: '12px' }}>{p.paymentId}</td>
              <td>{p.aadhaarMasked || '-'}</td>
              <td>{p.schemeName || p.schemeId}</td>
              <td>Rs {p.amount}</td>
              <td style={{ color: '#dc2626', fontSize: '12px' }}>{p.holdReason || 'Flagged'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
