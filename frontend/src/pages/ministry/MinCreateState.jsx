import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function MinCreateState() {
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [officer, setOfficer] = useState('Shri Ajay Verma');
  const [designation, setDesignation] = useState('Principal Secretary (Finance)');
  const [email, setEmail] = useState('finance.up@gov.in');
  const [phone, setPhone] = useState('+91-98765-11111');
  const [employeeId, setEmployeeId] = useState('IAS-2004-3456');

  const wallet = '0x1a2b...7d90';

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create State Admin Account">
        <div className="form-group">
          <label>State</label>
          <select value={stateName} onChange={(event) => setStateName(event.target.value)}>
            <option>Uttar Pradesh</option>
            <option>Maharashtra</option>
            <option>Bihar</option>
            <option>Rajasthan</option>
            <option>Tamil Nadu</option>
          </select>
        </div>
        <div className="form-group">
          <label>Officer Name</label>
          <input value={officer} onChange={(event) => setOfficer(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Designation</label>
          <input value={designation} onChange={(event) => setDesignation(event.target.value)} />
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
          <label>Govt Employee ID</label>
          <input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Wallet Address (Auto-generated)</label>
          <input value={wallet} readOnly />
        </div>
        <button className="btn">Create Account & Send Credentials</button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can create district accounts and assign jurisdiction.</div>
          <div>Can release funds to districts and submit UCs.</div>
          <div>Cannot allocate new schemes without ministry approval.</div>
          <div>Receives alerts for scheme or payment anomalies.</div>
        </div>
      </Card>
    </div>
  );
}
