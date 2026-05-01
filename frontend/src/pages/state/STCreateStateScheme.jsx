import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function STCreateStateScheme() {
  const [schemeName, setSchemeName] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [budget, setBudget] = useState('');
  const [beneficiaryAmount, setBeneficiaryAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!schemeName || !schemeId) {
      setError('Scheme name and ID are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPost('/api/state/scheme/create', {
        schemeId: schemeId.trim(),
        schemeName: schemeName.trim(),
        description: notes || `${schemeName} — state scheme`,
        schemeType: 'state_scheme',
        totalBudgetCrore: Number(budget || 0),
        perBeneficiaryAmount: Number(beneficiaryAmount || 0),
        beneficiaryAmountType: 'annual',
        targetBeneficiaries: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      });
      setSuccess('State scheme created successfully!');
      setSchemeName('');
      setSchemeId('');
      setBudget('');
      setBeneficiaryAmount('');
      setNotes('');
    } catch (err) {
      setError(err.message || 'Failed to create scheme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create State Scheme">
        <div className="form-group">
          <label>Scheme Name</label>
          <input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="e.g. Ladli Behna Yojana" />
        </div>
        <div className="form-group">
          <label>Scheme ID</label>
          <input value={schemeId} onChange={(e) => setSchemeId(e.target.value)} placeholder="e.g. LBY-2024" />
        </div>
        <div className="form-group">
          <label>Total Budget (Cr)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Per Beneficiary Amount</label>
          <input type="number" value={beneficiaryAmount} onChange={(e) => setBeneficiaryAmount(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Eligibility Notes</label>
          <textarea rows={4} placeholder="Eligibility, documents, or verification rules"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn" type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create State Scheme'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {success && <div className="helper" style={{ marginTop: '8px' }}>{success}</div>}
      </Card>

      <Card title="Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Name: {schemeName || '-'}</div>
          <div>Scheme ID: {schemeId || '-'}</div>
          <div>Total Budget: Rs {budget || '0'} Cr</div>
          <div>Per Beneficiary: Rs {beneficiaryAmount || '0'}</div>
        </div>
      </Card>
    </div>
  );
}
