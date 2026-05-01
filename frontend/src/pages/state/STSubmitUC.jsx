import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function STSubmitUC() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [quarter, setQuarter] = useState('Q1');
  const [amountUtilized, setAmountUtilized] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiGet('/api/state/funds')
      .then((res) => {
        const data = res?.data || [];
        const unique = [...new Map(data.filter(t => t.schemeId).map(t => [t.schemeId, { schemeId: t.schemeId, schemeName: t.schemeName || t.schemeId }])).values()];
        setSchemes(unique);
        setSelectedScheme(unique[0]?.schemeId || '');
      })
      .catch(() => {})
      .finally(() => setLoadingSchemes(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedScheme || !amountUtilized) {
      setError('Select scheme and enter amount');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPost('/api/state/uc/submit', {
        schemeId: selectedScheme,
        quarter,
        financialYear: '2024-25',
        amountUtilizedCrore: Number(amountUtilized),
        docHash: `UC-${Date.now()}`
      });
      setSuccess('Utilization Certificate submitted successfully!');
      setAmountUtilized('');
    } catch (err) {
      setError(err.message || 'Failed to submit UC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Submit Utilization Certificate">
        <div className="form-group">
          <label>Scheme</label>
          <select value={selectedScheme} onChange={(e) => setSelectedScheme(e.target.value)} disabled={loadingSchemes}>
            {schemes.map((s) => <option key={s.schemeId} value={s.schemeId}>{s.schemeName}</option>)}
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
          <input type="number" value={amountUtilized} onChange={(e) => setAmountUtilized(e.target.value)} placeholder="Enter utilized amount" />
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
    </div>
  );
}
