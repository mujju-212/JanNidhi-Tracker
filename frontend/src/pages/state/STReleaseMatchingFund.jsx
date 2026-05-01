import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function STReleaseMatchingFund() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [amount, setAmount] = useState('');
  const [ucRef, setUcRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiGet('/api/state/funds')
      .then((res) => {
        const data = res?.data || [];
        const unique = [...new Map(data.filter(t => t.schemeId && t.schemeId !== 'BUDGET_ALLOCATION').map(t => [t.schemeId, { schemeId: t.schemeId, schemeName: t.schemeName || t.schemeId }])).values()];
        setSchemes(unique);
        setSelectedScheme(unique[0]?.schemeId || '');
      })
      .catch(() => {})
      .finally(() => setLoadingSchemes(false));
  }, []);

  const handleRelease = async () => {
    if (!selectedScheme || !amount) {
      setError('Select scheme and enter amount');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPost('/api/state/matching-fund/release', {
        schemeId: selectedScheme,
        matchingAmountCrore: Number(amount),
        ucRef: ucRef || `UC-MATCH-${Date.now()}`,
        financialYear: '2024-25'
      });
      setSuccess('State matching share released successfully!');
      setAmount('');
      setUcRef('');
    } catch (err) {
      setError(err.message || 'Failed to release matching fund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release State Matching Share">
        <div className="form-group">
          <label>Scheme</label>
          <select value={selectedScheme} onChange={(e) => setSelectedScheme(e.target.value)} disabled={loadingSchemes}>
            {schemes.length === 0 && <option value="">No CSS schemes found</option>}
            {schemes.map((s) => <option key={s.schemeId} value={s.schemeId}>{s.schemeName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>State Share Amount (Cr)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter matching amount" />
        </div>
        <div className="form-group">
          <label>UC Reference</label>
          <input value={ucRef} onChange={(e) => setUcRef(e.target.value)} placeholder="UC-2024-STATE-001" />
        </div>
        <div className="form-group">
          <label>Upload Matching Fund Proof</label>
          <input type="file" />
        </div>
        <button className="btn" type="button" onClick={handleRelease} disabled={loading}>
          {loading ? 'Releasing...' : 'Release Matching Share'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {success && <div className="helper" style={{ marginTop: '8px' }}>{success}</div>}
      </Card>

      <Card title="Smart Contract Checks">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Verify scheme is CSS and requires state contribution.</div>
          <div>Validate UC for previous installment.</div>
          <div>Confirm state treasury wallet is active.</div>
          <div>Check remaining state share limit for FY.</div>
        </div>
      </Card>
    </div>
  );
}
