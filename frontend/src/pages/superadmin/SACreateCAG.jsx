import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function SACreateCAG() {
  const [name, setName] = useState('Shri G. K. Pillai');
  const [officerId, setOfficerId] = useState('CAG-2024-009');
  const [role, setRole] = useState('Central CAG');
  const [jurisdiction, setJurisdiction] = useState('All India');
  const [email, setEmail] = useState('cag.office@gov.in');
  const [phone, setPhone] = useState('+91-98765-43210');

  const wallet = '0x8d3a...9c44';

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create CAG Auditor Account">
        <div className="form-group">
          <label>Officer Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Officer ID</label>
          <input value={officerId} onChange={(event) => setOfficerId(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option>Central CAG</option>
            <option>State Auditor</option>
          </select>
        </div>
        <div className="form-group">
          <label>Jurisdiction</label>
          <select value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)}>
            <option>All India</option>
            <option>Uttar Pradesh</option>
            <option>Maharashtra</option>
            <option>Tamil Nadu</option>
            <option>Karnataka</option>
          </select>
        </div>
        <div className="form-group">
          <label>Official Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Official Phone</label>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Wallet Address (Auto-generated)</label>
          <input value={wallet} readOnly />
        </div>
        <button className="btn">Create Account & Send Credentials</button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Read-only access to all ministries and state ledgers.</div>
          <div>Can raise audit flags and request clarifications.</div>
          <div>Cannot modify or delete any transaction data.</div>
          <div>Receives real-time alerts for critical anomalies.</div>
          <div>Access token expires in 30 days unless renewed.</div>
        </div>
      </Card>
    </div>
  );
}
