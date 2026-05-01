import { useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';

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
  const [submitted, setSubmitted] = useState(false);

  const ministryCode = useMemo(() => {
    return `${toCode(ministryName)}-2024`;
  }, [ministryName]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
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
            <button className="btn" type="submit">
              Create Account & Send Credentials
            </button>
            <button className="btn secondary" type="button">
              Reset
            </button>
          </div>
        </form>
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

      {submitted ? (
        <Card title="Success">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Ministry account created successfully.</div>
            <div>Block Hash: 0xa3f9c2e8b4d7... (copyable)</div>
            <div>Temporary password sent to: {email}</div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
