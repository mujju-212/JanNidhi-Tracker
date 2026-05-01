import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function DTCreatePanchayat() {
  const [panchayat, setPanchayat] = useState('Ambegaon');
  const [officer, setOfficer] = useState('Smt. Nita Deshmukh');
  const [email, setEmail] = useState('panchayat.ambegaon@gov.in');
  const [phone, setPhone] = useState('+91-98765-44444');
  const [taluks, setTaluks] = useState([]);
  const [talukId, setTalukId] = useState('');
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiGet('/api/district/taluk/all')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        setTaluks(items);
        setTalukId(items[0]?.talukId || '');
      })
      .catch(() => {
        if (!mounted) return;
        setTaluks([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError('');
    setStatus('');
    if (!panchayat || !officer || !talukId) {
      setError('Enter panchayat details and select taluk.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiPost('/api/district/panchayat/create', {
        name: panchayat,
        officerName: officer,
        email,
        phone,
        talukId
      });
      setWallet(response?.data?.walletAddress || '');
      setStatus(response?.message || 'Panchayat account created.');
    } catch (err) {
      setError(err.message || 'Unable to create panchayat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create Panchayat Account">
        <div className="form-group">
          <label>Taluk</label>
          <select value={talukId} onChange={(event) => setTalukId(event.target.value)}>
            {taluks.length === 0 ? (
              <option value="">No taluks found</option>
            ) : (
              taluks.map((taluk) => (
                <option key={taluk.talukId} value={taluk.talukId}>
                  {taluk.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="form-group">
          <label>Panchayat Name</label>
          <input value={panchayat} onChange={(event) => setPanchayat(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Panchayat Officer</label>
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
          {loading ? 'Creating...' : 'Create Panchayat Account'}
        </button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can enroll villagers and trigger payments.</div>
          <div>Can upload work proofs and submit UCs.</div>
        </div>
      </Card>
    </div>
  );
}
