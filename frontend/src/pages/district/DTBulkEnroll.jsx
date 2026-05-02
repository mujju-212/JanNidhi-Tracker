import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function DTBulkEnroll() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) { setError('Please select a CSV file'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiPost('/api/district/beneficiary/add', fd);
      setResult(res?.data || { message: 'Uploaded successfully' });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Card title="Bulk Beneficiary Enrollment">
      <div className="helper" style={{ marginBottom: '12px' }}>
        Upload a CSV file with columns: aadhaarNumber, fullName, dateOfBirth, gender, bankName, ifscCode, village, schemeId
      </div>
      <div className="form-group">
        <label>Upload CSV</label>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0])} />
      </div>
      <button className="btn" type="button" onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload & Enroll'}
      </button>
      {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
      {result && <div className="helper" style={{ marginTop: '8px' }}>✅ {result.message || 'Bulk enrollment complete'}</div>}
    </Card>
  );
}
