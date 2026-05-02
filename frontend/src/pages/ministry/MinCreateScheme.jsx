import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

const SCHEME_TYPE_MAP = {
  central_sector: { label: 'Central Sector (100%)', centre: 100, state: 0 },
  centrally_sponsored: { label: 'Centrally Sponsored (60:40)', centre: 60, state: 40 },
  state_scheme: { label: 'State Matching (50:50)', centre: 50, state: 50 }
};

export default function MinCreateScheme() {
  const [schemeName, setSchemeName] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [schemeType, setSchemeType] = useState('central_sector');
  const [budget, setBudget] = useState('');
  const [perBeneficiary, setPerBeneficiary] = useState('');
  const [rules, setRules] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wallet, setWallet] = useState(null);

  const addRule = () => setRules((prev) => [...prev, '']);
  const updateRule = (index, value) => setRules((prev) => prev.map((r, i) => (i === index ? value : r)));
  const removeRule = (index) => setRules((prev) => prev.filter((_, i) => i !== index));

  const submitScheme = async () => {
    if (!schemeName.trim() || !schemeId.trim() || !budget) {
      setError('Please fill scheme name, ID, and budget.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const startDate = new Date().toISOString();
    const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
    const typeInfo = SCHEME_TYPE_MAP[schemeType];

    // Convert plain strings to {ruleText, ruleCode} objects for the model
    const eligibilityRules = rules
      .map((r) => r.trim())
      .filter(Boolean)
      .map((text, i) => ({ ruleText: text, ruleCode: `RULE_${i + 1}` }));

    try {
      // Scheme creation is DB-only — no money moving, no blockchain needed
      await apiPost('/api/ministry/scheme/create', {
        schemeId: schemeId.trim(),
        schemeName: schemeName.trim(),
        description: `${schemeName.trim()} — government scheme for eligible beneficiaries`,
        schemeType,
        totalBudgetCrore: Number(budget),
        perBeneficiaryAmount: Number(perBeneficiary || 0),
        beneficiaryAmountType: 'annual',
        targetBeneficiaries: 0,
        eligibilityRules,
        applicableStates: ['ALL'],
        startDate,
        endDate,
        guidelineDocHash: null,
        fundingRatioCentre: typeInfo.centre,
        fundingRatioState: typeInfo.state
      });

      setSuccess('✅ Scheme created successfully in database.');
      setSchemeName('');
      setSchemeId('');
      setBudget('');
      setPerBeneficiary('');
      setRules(['']);
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
          <input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="PM Scholarship for Higher Education" />
        </div>
        <div className="form-group">
          <label>Scheme ID</label>
          <input value={schemeId} onChange={(e) => setSchemeId(e.target.value)} placeholder="PMSS-2024" />
        </div>
        <div className="form-group">
          <label>Scheme Type</label>
          <select value={schemeType} onChange={(e) => setSchemeType(e.target.value)}>
            {Object.entries(SCHEME_TYPE_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Total Budget (Cr)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="6000" />
        </div>
        <div className="form-group">
          <label>Per Beneficiary Amount (₹)</label>
          <input type="number" value={perBeneficiary} onChange={(e) => setPerBeneficiary(e.target.value)} placeholder="50000" />
        </div>
        <div className="form-group">
          <label>Eligibility Rules</label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {rules.map((rule, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder={`Rule ${index + 1}: e.g. Must be Indian citizen`}
                  style={{ flex: 1 }}
                />
                {rules.length > 1 && (
                  <button className="btn secondary" type="button" onClick={() => removeRule(index)} style={{ padding: '4px 10px', fontSize: '12px' }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button className="btn secondary" type="button" onClick={addRule} style={{ marginTop: '8px' }}>
            + Add Rule
          </button>
        </div>
        <button className="btn" type="button" onClick={submitScheme} disabled={loading}>
          {loading ? 'Creating...' : 'Create Scheme'}
        </button>
        {wallet && <div className="helper" style={{ marginTop: '6px', fontSize: '11px' }}>Wallet: {wallet.slice(0, 10)}...</div>}
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {success && <div className="helper" style={{ marginTop: '8px' }}>{success}</div>}
      </Card>

      <Card title="Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Name: {schemeName || '-'}</div>
          <div>Scheme ID: {schemeId || '-'}</div>
          <div>Type: {SCHEME_TYPE_MAP[schemeType]?.label}</div>
          <div>Total Budget: Rs {budget || '0'} Cr</div>
          <div>Per Beneficiary: ₹{perBeneficiary || '0'}</div>
          <div>Centre:State = {SCHEME_TYPE_MAP[schemeType]?.centre}:{SCHEME_TYPE_MAP[schemeType]?.state}</div>
          <div>Rules: {rules.filter(Boolean).length}</div>
        </div>
      </Card>
    </div>
  );
}
