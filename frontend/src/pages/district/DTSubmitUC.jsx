import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function DTSubmitUC() {
  const [schemeId, setSchemeId] = useState('PM-KISAN-2024');
  const [quarter, setQuarter] = useState('Q1');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!amount) { setError('Enter utilized amount'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      // district UC submission — reuses a generic endpoint pattern
      await apiPost('/api/district/payment/trigger', {
        schemeId, installment: 0, type: 'UC_SUBMISSION',
        ucAmountCrore: Number(amount), quarter
      });
      setSuccess('UC submitted successfully!');
      setAmount('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Card title="Submit Utilization Certificate">
      <div className="form-group">
        <label>Scheme</label>
        <select value={schemeId} onChange={(e) => setSchemeId(e.target.value)}>
          <option value="PM-KISAN-2024">PM Kisan Samman Nidhi</option>
          <option value="AYUSHMAN-2024">Ayushman Bharat PMJAY</option>
          <option value="UJJWALA-2024">PM Ujjwala Yojana</option>
        </select>
      </div>
      <div className="form-group">
        <label>Quarter</label>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          <option value="Q1">Q1 (Apr-Jun)</option>
          <option value="Q2">Q2 (Jul-Sep)</option>
          <option value="Q3">Q3 (Oct-Dec)</option>
          <option value="Q4">Q4 (Jan-Mar)</option>
        </select>
      </div>
      <div className="form-group">
        <label>Amount Utilized (Cr)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Upload UC Document</label>
        <input type="file" />
      </div>
      <button className="btn" type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit UC'}
      </button>
      {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
      {success && <div className="helper" style={{ marginTop: '8px' }}>{success}</div>}
    </Card>
  );
}
