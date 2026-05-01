import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function DTCreateBlock() {
  const [block, setBlock] = useState('Haveli');
  const [officer, setOfficer] = useState('Shri Suresh Kale');
  const [email, setEmail] = useState('block.haveli@gov.in');
  const [phone, setPhone] = useState('+91-98765-33333');
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setStatus('');
    if (!block || !officer) {
      setError('Enter taluk name and officer name.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiPost('/api/district/taluk/create', {
        name: block,
        officerName: officer,
        email,
        phone
      });
      setWallet(response?.data?.walletAddress || '');
      setStatus(response?.message || 'Taluk account created.');
    } catch (err) {
      setError(err.message || 'Unable to create taluk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create Taluk Account">
        <div className="form-group">
          <label>Taluk Name</label>
          <input value={block} onChange={(event) => setBlock(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Taluk Officer</label>
          <input value={officer} onChange={(event) => setOfficer(event.target.value)} />
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
        {status ? <div className="helper">{status}</div> : null}
        {error ? <div className="alert">{error}</div> : null}
        <button className="btn" type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Taluk Account'}
        </button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can manage panchayat accounts and verify payments.</div>
          <div>Can submit UCs for taluk-level releases.</div>
        </div>
      </Card>
    </div>
  );
}
