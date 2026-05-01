import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function STCreateStateScheme() {
  const [schemeName, setSchemeName] = useState('Maharashtra Farmer Relief');
  const [schemeId, setSchemeId] = useState('MH-STATE-2024-01');
  const [budget, setBudget] = useState('1200');
  const [beneficiaryAmount, setBeneficiaryAmount] = useState('5000');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create State Scheme">
        <div className="form-group">
          <label>Scheme Name</label>
          <input value={schemeName} onChange={(event) => setSchemeName(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Scheme ID</label>
          <input value={schemeId} onChange={(event) => setSchemeId(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Total Budget (Cr)</label>
          <input value={budget} onChange={(event) => setBudget(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Per Beneficiary Amount</label>
          <input
            value={beneficiaryAmount}
            onChange={(event) => setBeneficiaryAmount(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Eligibility Notes</label>
          <textarea rows="4" placeholder="Eligibility, documents, or verification rules" />
        </div>
        <button className="btn">Submit Scheme for Approval</button>
      </Card>

      <Card title="Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Name: {schemeName}</div>
          <div>Scheme ID: {schemeId}</div>
          <div>Total Budget: Rs {budget} Cr</div>
          <div>Per Beneficiary: Rs {beneficiaryAmount}</div>
        </div>
      </Card>
    </div>
  );
}
