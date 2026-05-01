import { useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

const ministryOptions = [
  'Ministry of Health & Family Welfare',
  'Ministry of Education',
  'Ministry of Agriculture',
  'Ministry of Rural Development',
  'Ministry of Railways'
];

const toCode = (name) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .replace(/[^A-Z]/gi, '')
    .toUpperCase()
    .slice(0, 6);
};

export default function SACreateMinistry() {
  const [ministryName, setMinistryName] = useState(ministryOptions[0]);
  const [hod, setHod] = useState('Dr. Mansukh Mandaviya');
  const [designation, setDesignation] = useState('Secretary');
  const [email, setEmail] = useState('sec.mohfw@gov.in');
  const [phone, setPhone] = useState('+91-XXXXXXXXXX');
  const [employeeId, setEmployeeId] = useState('IAS-2024-XXXX');
  const [budgetCap, setBudgetCap] = useState('89155');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('');

  const ministryCode = useMemo(() => {
    return `${toCode(ministryName)}-2024`;
  }, [ministryName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setStep('');

    if (!ministryName || !hod || !email || !employeeId) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    setStep('Validating details...');
    try {
      setStep('Creating ministry account...');
      const response = await apiPost('/api/superadmin/ministry/create', {
        ministryName,
        ministryCode,
        hodName: hod,
        designation,
        email,
        phone,
        employeeId,
        budgetCapCrore: Number(budgetCap || 0)
      });
      setResult(response?.data || {});
      setStep('');
    } catch (err) {
      setError(err.message || 'Unable to create ministry account.');
      setStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create Ministry Account">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ministry Name</label>
            <select
              value={ministryName}
              onChange={(event) => setMinistryName(event.target.value)}
            >
              {ministryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ministry Code</label>
            <input value={ministryCode} readOnly />
          </div>

          <div className="form-group">
            <label>HOD Full Name</label>
            <input value={hod} onChange={(event) => setHod(event.target.value)} />
          </div>

          <div className="form-group">
            <label>Designation</label>
            <input
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Official Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Employee ID</label>
            <input
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Budget Cap (Crore)</label>
            <input
              type="number"
              value={budgetCap}
              onChange={(event) => setBudgetCap(event.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account & Send Credentials'}
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setError('');
                setResult(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>
        {loading && step ? <div className="helper" style={{ marginTop: '12px' }}>{step}</div> : null}
        {error ? <div className="alert" style={{ marginTop: '12px' }}>{error}</div> : null}
      </Card>

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: Finance Ministry Wallet (0x1a2b...)</div>
          <div>To: New Ministry Wallet (0x4a9f...)</div>
          <div>Action: MINISTRY_CREATED</div>
          <div>Budget Cap: Rs {budgetCap} Cr</div>
          <div>Status: Permanent & Immutable</div>
        </div>
      </Card>

      {result ? (
        <Card title="Success">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Ministry account created successfully.</div>
            <div>Wallet Address: {result.walletAddress || '-'}</div>
            <div>Blockchain Tx Hash: {result.blockchainTx?.txHash || '-'}</div>
            <div>Block Number: {result.blockchainTx?.blockNumber ?? '-'}</div>
            <div>Blockchain Status: {result.blockchainStatus || '-'}</div>
            <div>{result.blockchainNote || '-'}</div>
            <div>Temporary password: {result.tempPassword || '-'}</div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
