import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function MinCreateScheme() {
  const [schemeName, setSchemeName] = useState('Ayushman Bharat - PM-JAY');
  const [schemeId, setSchemeId] = useState('MOHFW-CSS-2024-001');
  const [schemeType, setSchemeType] = useState('Centrally Sponsored (60:40)');
  const [budget, setBudget] = useState('7200');
  const [perBeneficiary, setPerBeneficiary] = useState('500000');
  const [rules, setRules] = useState([
    'Aadhaar verification required',
    'Below Poverty Line (SECC database)'
  ]);

  const addRule = () => {
    setRules((prev) => [...prev, '']);
  };

  const updateRule = (index, value) => {
    setRules((prev) => prev.map((rule, i) => (i === index ? value : rule)));
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
            <option>Central Sector (100%)</option>
            <option>Centrally Sponsored (60:40)</option>
            <option>State Matching (50:50)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Total Budget (Cr)</label>
          <input value={budget} onChange={(event) => setBudget(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Per Beneficiary Amount</label>
          <input
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
        <button className="btn">Deploy Scheme on Blockchain</button>
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
