import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function MinCreateScheme() {
  const [schemeName, setSchemeName] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [schemeType, setSchemeType] = useState('css');
  const [budget, setBudget] = useState('');
  const [perBeneficiary, setPerBeneficiary] = useState('');
  const [rules, setRules] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addRule = () => {
    setRules((prev) => [...prev, '']);
  };

  const updateRule = (index, value) => {
    setRules((prev) => prev.map((rule, i) => (i === index ? value : rule)));
  };

  const submitScheme = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPost('/api/ministry/scheme/create', {
        schemeId: schemeId.trim(),
        schemeName: schemeName.trim(),
        description: `${schemeName.trim()} for beneficiaries`,
        schemeType,
        totalBudgetCrore: Number(budget || 0),
        perBeneficiaryAmount: Number(perBeneficiary || 0),
        beneficiaryAmountType: 'annual',
        targetBeneficiaries: 0,
        eligibilityRules: rules.map((rule) => rule.trim()).filter(Boolean),
        applicableStates: ['ALL'],
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        guidelineDocHash: null,
        fundingRatioCentre: schemeType === 'css' ? 60 : 100,
        fundingRatioState: schemeType === 'css' ? 40 : 0
      });
      setSuccess('Scheme created successfully.');
    } catch (err) {
      setError(err.message || 'Unable to create scheme.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create New Scheme">
        <div className="form-group">
          <label>Scheme Name</label>
          <input value={schemeName} onChange={(event) => setSchemeName(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Scheme ID</label>
          <input value={schemeId} onChange={(event) => setSchemeId(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Scheme Type</label>
          <select value={schemeType} onChange={(event) => setSchemeType(event.target.value)}>
            <option value="central">Central Sector (100%)</option>
            <option value="css">Centrally Sponsored (60:40)</option>
            <option value="matching">State Matching (50:50)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Total Budget (Cr)</label>
          <input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Per Beneficiary Amount</label>
          <input
            type="number"
            value={perBeneficiary}
            onChange={(event) => setPerBeneficiary(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Eligibility Rules</label>
          <div style={{ display: 'grid', gap: '10px' }}>
            {rules.map((rule, index) => (
              <input
                key={index}
                value={rule}
                onChange={(event) => updateRule(index, event.target.value)}
                placeholder="Enter rule"
              />
            ))}
          </div>
          <button className="btn secondary" type="button" onClick={addRule}>
            Add Rule
          </button>
        </div>
        <button className="btn" type="button" onClick={submitScheme} disabled={loading}>
          {loading ? 'Submitting...' : 'Deploy Scheme on Blockchain'}
        </button>
        {error ? <div className="alert">{error}</div> : null}
        {success ? <div className="helper">{success}</div> : null}
      </Card>

      <Card title="Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Name: {schemeName}</div>
          <div>Scheme ID: {schemeId}</div>
          <div>Type: {schemeType}</div>
          <div>Total Budget: Rs {budget} Cr</div>
          <div>Per Beneficiary: Rs {perBeneficiary}</div>
        </div>
      </Card>
    </div>
  );
}
