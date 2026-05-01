import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function MinCreateState() {
  const [stateName, setStateName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [officer, setOfficer] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createAccount = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await apiPost('/api/ministry/state/create', {
        state: stateName.trim(),
        stateCode: stateCode.trim().toUpperCase(),
        fullName: officer.trim(),
        designation: designation.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employeeId: employeeId.trim()
      });
      setResult(response?.data || null);
    } catch (err) {
      setError(err.message || 'Unable to create state account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create State Admin Account">
        <div className="form-group">
          <label>State</label>
          <input value={stateName} onChange={(event) => setStateName(event.target.value)} placeholder="Maharashtra" />
        </div>
        <div className="form-group">
          <label>State Code</label>
          <input value={stateCode} onChange={(event) => setStateCode(event.target.value)} placeholder="MH" />
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
          <input value={result?.walletAddress || '-'} readOnly />
        </div>
        <button className="btn" type="button" onClick={createAccount} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account & Send Credentials'}
        </button>
        {error ? <div className="alert">{error}</div> : null}
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
