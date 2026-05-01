import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function SACreateCAG() {
  const [name, setName] = useState('Shri G. K. Pillai');
  const [officerId, setOfficerId] = useState('CAG-2024-009');
  const [role, setRole] = useState('central_cag');
  const [jurisdiction, setJurisdiction] = useState('All India');
  const [email, setEmail] = useState('cag.office@gov.in');
  const [phone, setPhone] = useState('+91-98765-43210');
  const [designation, setDesignation] = useState('Auditor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setError('');
    setResult(null);
    if (!name || !officerId || !email) {
      setError('Please fill required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/api/superadmin/cag/create', {
        fullName: name,
        email,
        phone,
        employeeId: officerId,
        role,
        jurisdiction:
          role === 'state_auditor' && jurisdiction !== 'All India'
            ? { state: jurisdiction, stateCode: jurisdiction.toUpperCase().slice(0, 3) }
            : {},
        designation
      });
      setResult(response?.data || null);
    } catch (err) {
      setError(err.message || 'Unable to create CAG account.');
    } finally {
      setLoading(false);
    }
  };

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
            <option value="central_cag">Central CAG</option>
            <option value="state_auditor">State Auditor</option>
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
          <label>Wallet Address (Auto-generated)</label>
          <input value={result?.walletAddress || ''} readOnly />
        </div>
        {error ? <div className="alert">{error}</div> : null}
        <button className="btn" type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account & Send Credentials'}
        </button>
      </Card>

      <Card title={result ? 'Account Created' : 'Permissions Summary'}>
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          {result ? (
            <>
              <div>Auditor account created successfully.</div>
              <div>Wallet: {result.walletAddress || '-'}</div>
              <div>Temporary password: {result.tempPassword || '-'}</div>
            </>
          ) : (
            <>
              <div>Read-only access to all ministries and state ledgers.</div>
              <div>Can raise audit flags and request clarifications.</div>
              <div>Cannot modify or delete any transaction data.</div>
              <div>Receives real-time alerts for critical anomalies.</div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
