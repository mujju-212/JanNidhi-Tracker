import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function DTTriggerPayment() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [schemeId, setSchemeId] = useState('PM-KISAN-2024');
  const [installment, setInstallment] = useState('1');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    apiGet('/api/district/beneficiaries')
      .then((res) => setBeneficiaries(res?.data || []))
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  const eligible = beneficiaries.filter(b =>
    (b.enrolledSchemes || []).some(s => s.schemeId === schemeId) && b.status === 'active'
  );

  const triggerPayments = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await apiPost('/api/district/payment/trigger', {
        schemeId, installment: Number(installment),
        beneficiaryIds: eligible.map(b => b._id)
      });
      setResult(res?.data || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Step 1: Select Scheme">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Scheme</label>
            <select value={schemeId} onChange={(e) => setSchemeId(e.target.value)}>
              <option value="PM-KISAN-2024">PM Kisan Samman Nidhi</option>
              <option value="AYUSHMAN-2024">Ayushman Bharat PMJAY</option>
              <option value="UJJWALA-2024">PM Ujjwala Yojana</option>
            </select>
          </div>
          <div className="form-group">
            <label>Installment</label>
            <select value={installment} onChange={(e) => setInstallment(e.target.value)}>
              {[1,2,3,4].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card title={`Step 2: Eligible Beneficiaries (${eligible.length})`}>
        {loadingList ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Aadhaar</th><th>Bank</th><th>Village</th></tr></thead>
            <tbody>
              {eligible.length === 0 && <tr><td colSpan={4} className="helper">No eligible beneficiaries for this scheme</td></tr>}
              {eligible.map((b) => (
                <tr key={b._id}>
                  <td>{b.fullName}</td>
                  <td>{b.aadhaarMasked}</td>
                  <td>{b.bankName}</td>
                  <td>{b.village}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Step 3: Confirm Batch">
        <div className="helper" style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
          <div>Total eligible: {eligible.length}</div>
          <div>Scheme: {schemeId}</div>
          <div>Installment: {installment}</div>
        </div>
        <button className="btn" type="button" onClick={triggerPayments} disabled={loading || eligible.length === 0}>
          {loading ? 'Processing...' : 'Initiate Payment'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {result && <div className="helper" style={{ marginTop: '8px' }}>✅ Payments initiated: {result.count || result.processed || 'OK'}</div>}
      </Card>
    </div>
  );
}
