import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'active' || status === 'paid' || status === 'success' ? 'low' : 'medium');

export default function DTBeneficiaryDetail() {
  const { beneficiaryId } = useParams();
  const [beneficiary, setBeneficiary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          apiGet('/api/district/beneficiaries'),
          apiGet('/api/district/payments')
        ]);
        const all = bRes?.data || [];
        const found = all.find(b => b._id === beneficiaryId) || all[0];
        setBeneficiary(found || null);

        const allPayments = pRes?.data || [];
        setPayments(allPayments.filter(p => p.aadhaarHash === found?.aadhaarHash));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [beneficiaryId]);

  if (loading) return <div className="loading">Loading beneficiary...</div>;
  if (!beneficiary) return <div className="alert">Beneficiary not found</div>;

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Beneficiary Profile" action={<Link className="btn secondary" to="/district/beneficiaries">Back to List</Link>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div><div className="helper">Name</div><div style={{ fontWeight: 600 }}>{beneficiary.fullName}</div></div>
          <div><div className="helper">Aadhaar</div><div>{beneficiary.aadhaarMasked}</div></div>
          <div><div className="helper">Bank</div><div>{beneficiary.bankName}</div></div>
          <div><div className="helper">IFSC</div><div>{beneficiary.ifscCode}</div></div>
          <div><div className="helper">Village</div><div>{beneficiary.village}</div></div>
          <div><div className="helper">Gender</div><div>{beneficiary.gender}</div></div>
          <div><div className="helper">Status</div><Badge tone={statusTone(beneficiary.status)} label={(beneficiary.status || 'active').toUpperCase()} /></div>
        </div>
      </Card>

      <Card title="Schemes Enrolled">
        <table className="table">
          <thead><tr><th>Scheme</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {(beneficiary.enrolledSchemes || []).length === 0 && <tr><td colSpan={3} className="helper">No schemes</td></tr>}
            {(beneficiary.enrolledSchemes || []).map((s, i) => (
              <tr key={i}>
                <td>{s.schemeName || s.schemeId}</td>
                <td>Rs {s.amount || '-'}</td>
                <td><Badge tone="low" label={(s.status || 'active').toUpperCase()} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title={`Payment History (${payments.length})`}>
        <table className="table">
          <thead><tr><th>Payment ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {payments.length === 0 && <tr><td colSpan={4} className="helper">No payments yet</td></tr>}
            {payments.map((p) => (
              <tr key={p._id}>
                <td style={{ fontSize: '12px' }}>{p.paymentId}</td>
                <td>Rs {p.amount}</td>
                <td><Badge tone={statusTone(p.status)} label={p.status?.toUpperCase()} /></td>
                <td style={{ fontSize: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
