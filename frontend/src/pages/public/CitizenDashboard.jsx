import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/citizen/my-benefits')
      .then((response) => {
        setCitizen(response?.data?.citizen || null);
        setBenefits(response?.data?.schemes || []);
      })
      .catch((err) => {
        if (err.status === 401) {
          localStorage.removeItem('jn_citizen_token');
          navigate('/public/citizen-login', { replace: true, state: { from: '/public/citizen-dashboard' } });
          return;
        }
        setError(err.message || 'Unable to load your benefits.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jn_citizen_token');
    navigate('/public/citizen-login', { replace: true });
  };

  if (loading) return <div className="loading">Loading your benefits...</div>;
  if (error) return <div className="alert" style={{ margin: '40px auto', maxWidth: '500px' }}>{error}</div>;

  return (
    <div className="grid" style={{ gap: '16px', maxWidth: '600px', margin: '20px auto' }}>
      <Card title="Citizen Profile">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Name: <strong>{citizen?.name || '-'}</strong></div>
          <div>Aadhaar: {citizen?.aadhaarMasked || '-'}</div>
          <div>Bank: {citizen?.bankName || '-'} {citizen?.ifscCode ? `(${citizen.ifscCode})` : ''}</div>
          <div>Location: {[citizen?.district, citizen?.state].filter(Boolean).join(', ') || '-'}</div>
        </div>
      </Card>

      <Card title="My Benefits">
        {benefits.length === 0 && <div className="helper">No benefits found for your Aadhaar</div>}
        {benefits.map((benefit) => (
          <div key={benefit.schemeId} className="stat-card" style={{ marginBottom: '10px' }}>
            <div className="stat-meta">
              <strong>{benefit.schemeName || benefit.schemeId}</strong>
              <span>Total Paid: Rs {Number(benefit.totalPaid || 0).toFixed(2)}</span>
              <span>Payments Received: {benefit.paymentsCount || 0}</span>
              <span>Enrollment Status: {benefit.enrollmentStatus || 'active'}</span>
              <span>Latest Payment Status: {benefit.latestPaymentStatus || 'not_started'}</span>
              <span>Latest Installment: {benefit.latestInstallment ?? '-'}</span>
            </div>
          </div>
        ))}
      </Card>

      <div>
        <button className="btn secondary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
