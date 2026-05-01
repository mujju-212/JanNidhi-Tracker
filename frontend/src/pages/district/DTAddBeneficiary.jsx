import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function DTAddBeneficiary() {
  const [aadhaar, setAadhaar] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('M');
  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [village, setVillage] = useState('');
  const [schemeId, setSchemeId] = useState('PM-KISAN-2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dupResult, setDupResult] = useState(null);

  const verifyAadhaar = async () => {
    if (!aadhaar || aadhaar.length < 12) { setError('Enter valid 12-digit Aadhaar'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiPost('/api/district/verify-aadhaar', { aadhaarNumber: aadhaar });
      setResult(res?.data || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const checkDuplicate = async () => {
    try {
      const res = await apiPost('/api/district/beneficiary/check-duplicate', { aadhaarNumber: aadhaar, schemeId });
      setDupResult(res?.data || {});
    } catch (err) { setError(err.message); }
  };

  const enroll = async () => {
    if (!aadhaar || !fullName) { setError('Aadhaar and name required'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiPost('/api/district/beneficiary/add', {
        aadhaarNumber: aadhaar, fullName, dateOfBirth: dob, gender,
        bankName, ifscCode: ifsc, village, schemeId
      });
      setResult(res?.data || {});
      setError('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Step 1: Aadhaar Verification">
        <div className="form-group">
          <label>Aadhaar Number</label>
          <input placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
        </div>
        <button className="btn secondary" type="button" onClick={verifyAadhaar} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Aadhaar'}
        </button>
        {result?.verified && <div className="helper" style={{ marginTop: '8px' }}>✅ Aadhaar hash generated</div>}
      </Card>

      <Card title="Step 2: Beneficiary Details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group"><label>Full Name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="form-group"><label>Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
          <div className="form-group"><label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}><option value="M">Male</option><option value="F">Female</option></select>
          </div>
          <div className="form-group"><label>Village</label><input value={village} onChange={(e) => setVillage(e.target.value)} /></div>
          <div className="form-group"><label>Bank Name</label><input value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
          <div className="form-group"><label>IFSC Code</label><input value={ifsc} onChange={(e) => setIfsc(e.target.value)} /></div>
        </div>
      </Card>

      <Card title="Step 3: Scheme & Duplicate Check">
        <div className="form-group">
          <label>Scheme</label>
          <select value={schemeId} onChange={(e) => setSchemeId(e.target.value)}>
            <option value="PM-KISAN-2024">PM Kisan Samman Nidhi</option>
            <option value="AYUSHMAN-2024">Ayushman Bharat PMJAY</option>
            <option value="UJJWALA-2024">PM Ujjwala Yojana</option>
          </select>
        </div>
        <button className="btn secondary" type="button" onClick={checkDuplicate}>Run Duplicate Check</button>
        {dupResult && <div className="helper" style={{ marginTop: '8px' }}>
          {dupResult.isDuplicate ? '⚠️ Already enrolled in this scheme' : '✅ No duplicate found'}
        </div>}
      </Card>

      <Card title="Step 4: Enroll">
        <button className="btn" type="button" onClick={enroll} disabled={loading}>
          {loading ? 'Enrolling...' : 'Enroll on Blockchain'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {result?.beneficiaryId && <div className="helper" style={{ marginTop: '8px' }}>✅ Enrolled: {result.beneficiaryId}</div>}
      </Card>
    </div>
  );
}
