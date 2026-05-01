import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function STCreateDistrict() {
  const [district, setDistrict] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [collector, setCollector] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createDistrict = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await apiPost('/api/state/district/create', {
        district: district.trim(),
        districtCode: districtCode.trim().toUpperCase(),
        fullName: collector.trim(),
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
      setResult(response?.data || null);
    } catch (err) {
      setError(err.message || 'Unable to create district account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create District Admin Account">
        <div className="form-group">
          <label>District</label>
          <input value={district} onChange={(event) => setDistrict(event.target.value)} />
        </div>
        <div className="form-group">
          <label>District Code</label>
          <input value={districtCode} onChange={(event) => setDistrictCode(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Collector Name</label>
          <input value={collector} onChange={(event) => setCollector(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Designation</label>
          <input value={designation} onChange={(event) => setDesignation(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Govt Employee ID</label>
          <input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} />
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
          <input value={result?.walletAddress || '-'} readOnly />
        </div>
        <button className="btn" type="button" onClick={createDistrict} disabled={loading}>
          {loading ? 'Creating...' : 'Create District Account'}
        </button>
        {error ? <div className="alert">{error}</div> : null}
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can enroll beneficiaries and trigger payments.</div>
          <div>Can release funds to panchayats and blocks.</div>
          <div>Must submit UCs for each installment.</div>
        </div>
      </Card>
    </div>
  );
}
