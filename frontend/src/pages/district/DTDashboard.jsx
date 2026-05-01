import { useEffect, useState } from 'react';
import { Banknote, CreditCard, Wallet, Users, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { apiGet } from '../../services/api.js';

export default function DTDashboard() {
  const [dashboard, setDashboard] = useState({});
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet('/api/district/dashboard'),
      apiGet('/api/district/payments'),
      apiGet('/api/district/complaints')
    ]).then(([dRes, pRes, cRes]) => {
      setDashboard(dRes?.data || {});
      setPayments((pRes?.data || []).slice(0, 8));
      setComplaints(cRes?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading district dashboard...</div>;

  const stats = [
    { title: 'Received from State', value: `Rs ${(dashboard.received || 0).toFixed(2)} Cr`, sub: 'Confirmed', icon: Banknote, accent: '#0f4aa7' },
    { title: 'Paid to Beneficiaries', value: `Rs ${(dashboard.paid || 0).toFixed(2)} Cr`, sub: 'All payments', icon: CreditCard, accent: '#16b6a4' },
    { title: 'Remaining Balance', value: `Rs ${((dashboard.received || 0) - (dashboard.paid || 0)).toFixed(2)} Cr`, sub: 'Available', icon: Wallet, accent: '#1aa26f' },
    { title: 'Total Beneficiaries', value: String(dashboard.beneficiaries || 0), sub: 'Enrolled', icon: Users, accent: '#334155' },
    { title: 'Active Flags', value: String(dashboard.flags || 0), sub: 'Needs response', icon: AlertTriangle, accent: '#e8515b' }
  ];

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      <Card title={`Recent Payments (${payments.length})`}>
        <table className="table">
          <thead><tr><th>Payment ID</th><th>Scheme</th><th>Beneficiary</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {payments.length === 0 && <tr><td colSpan={5} className="helper">No payments yet</td></tr>}
            {payments.map((p) => (
              <tr key={p._id}>
                <td style={{ fontSize: '12px' }}>{p.paymentId}</td>
                <td>{p.schemeName || p.schemeId}</td>
                <td>{p.aadhaarMasked || '-'}</td>
                <td>Rs {p.amount}</td>
                <td style={{ color: p.status === 'success' ? '#16a34a' : '#dc2626' }}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title={`Open Complaints (${complaints.filter(c => c.status !== 'resolved').length})`}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {complaints.filter(c => c.status !== 'resolved').length === 0 && <div className="helper">No open complaints</div>}
          {complaints.filter(c => c.status !== 'resolved').slice(0, 5).map((c) => (
            <div key={c._id} className="stat-card">
              <div className="stat-meta">
                <strong>{c.complaintId}</strong>
                <span>{c.description?.slice(0, 60)}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#f59e0b' }}>{c.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
