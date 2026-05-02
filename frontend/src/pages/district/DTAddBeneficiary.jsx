import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function DTAddBeneficiary() {
  const [aadhaar, setAadhaar] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [error, setError] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [enrollResult, setEnrollResult] = useState(null);
  const [dupResult, setDupResult] = useState(null);

  // Load schemes from received funds
  useEffect(() => {
    apiGet('/api/district/funds')
      .then((res) => {
        const fundData = res?.data || [];
        const uniqueSchemes = [
          ...new Map(
            fundData
              .filter((f) => f.schemeId)
              .map((f) => [f.schemeId, { schemeId: f.schemeId, schemeName: f.schemeName || f.schemeId }])
          ).values()
        ];
        setSchemes(uniqueSchemes);
        if (uniqueSchemes.length > 0) setSchemeId(uniqueSchemes[0].schemeId);
      })
      .catch(console.error)
      .finally(() => setLoadingSchemes(false));
  }, []);

  const selectedScheme = schemes.find((s) => s.schemeId === schemeId);

  // Step 1: Verify Aadhaar via mock service
  const verifyAadhaar = async () => {
    if (!aadhaar || aadhaar.length < 12) { setError('Enter valid 12-digit Aadhaar'); return; }
    setLoading(true); setError(''); setVerifyResult(null); setEnrollResult(null); setDupResult(null);
    try {
      const res = await apiPost('/api/district/verify-aadhaar', { aadhaarNumber: aadhaar });
      setVerifyResult(res?.data || null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Step 2: Check duplicate
  const checkDuplicate = async () => {
    if (!aadhaar || !schemeId) { setError('Enter Aadhaar and select scheme first'); return; }
    setError(''); setDupResult(null);
    try {
      const res = await apiGet(`/api/district/beneficiary/check-duplicate?aadhaarNumber=${aadhaar}&schemeId=${schemeId}`);
      setDupResult(res?.data || {});
    } catch (err) { setError(err.message); }
  };

  // Step 3: Enroll — DB only, no blockchain
  const enroll = async () => {
    if (!aadhaar) { setError('Enter Aadhaar number first'); return; }
    if (!schemeId || !selectedScheme) { setError('Select a scheme'); return; }
    setLoading(true); setError(''); setEnrollResult(null);
    try {
      const res = await apiPost('/api/district/beneficiary/add', {
        aadhaarNumber: aadhaar,
        schemeId: schemeId,
        schemeName: selectedScheme.schemeName
      });
      setEnrollResult(res?.data || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      {/* Step 1: Aadhaar Verification */}
      <Card title="Step 1: Verify Aadhaar">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Aadhaar Number (12 digits)</label>
            <input
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              maxLength={12}
            />
          </div>
          <button className="btn secondary" type="button" onClick={verifyAadhaar} disabled={loading || aadhaar.length < 12}>
            {loading ? 'Verifying...' : 'Verify Aadhaar'}
          </button>
        </div>
        {verifyResult && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(22, 163, 74, 0.06)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>✅ Aadhaar Verified (Mock UIDAI)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13px' }}>
              <div><span className="helper">Name:</span> <strong>{verifyResult.name}</strong></div>
              <div><span className="helper">DOB:</span> <strong>{verifyResult.dob}</strong></div>
              <div><span className="helper">Gender:</span> <strong>{verifyResult.gender}</strong></div>
              <div><span className="helper">State:</span> <strong>{verifyResult.state}</strong></div>
              <div><span className="helper">District:</span> <strong>{verifyResult.district}</strong></div>
              <div><span className="helper">Father:</span> <strong>{verifyResult.fatherName}</strong></div>
            </div>
          </div>
        )}
      </Card>

      {/* Step 2: Select Scheme + Duplicate Check */}
      <Card title="Step 2: Select Scheme & Check Duplicate">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Scheme</label>
            <select value={schemeId} onChange={(e) => setSchemeId(e.target.value)} disabled={loadingSchemes}>
              {schemes.length === 0 && <option value="">No schemes available (receive funds first)</option>}
              {schemes.map((s) => (
                <option key={s.schemeId} value={s.schemeId}>{s.schemeName}</option>
              ))}
            </select>
          </div>
          <button className="btn secondary" type="button" onClick={checkDuplicate} disabled={!aadhaar || !schemeId}>
            Check Duplicate
          </button>
        </div>
        {dupResult && (
          <div style={{ marginTop: '8px' }}>
            {dupResult.duplicate ? (
              <Badge tone="critical" label="⚠️ ALREADY ENROLLED IN THIS SCHEME" />
            ) : (
              <Badge tone="low" label="✅ NO DUPLICATE — SAFE TO ENROLL" />
            )}
          </div>
        )}
      </Card>

      {/* Step 3: Enroll */}
      <Card title="Step 3: Enroll Beneficiary (DB Only — No Blockchain)">
        <div className="helper" style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
          <div>Aadhaar: <strong>{aadhaar || '-'}</strong></div>
          <div>Name: <strong>{verifyResult?.name || '(verify Aadhaar first)'}</strong></div>
          <div>Scheme: <strong>{selectedScheme?.schemeName || '-'}</strong></div>
          <div style={{ fontSize: '11px', opacity: 0.6 }}>Enrollment is saved to database only. Blockchain is used only when payment is triggered.</div>
        </div>
        <button
          className="btn" type="button" onClick={enroll}
          disabled={loading || !aadhaar || !schemeId || dupResult?.duplicate}
        >
          {loading ? 'Enrolling...' : 'Enroll Beneficiary'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {enrollResult?.beneficiaryId && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(22, 163, 74, 0.06)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: '6px' }}>✅ Beneficiary Enrolled Successfully</div>
            <div style={{ fontSize: '13px', display: 'grid', gap: '4px' }}>
              <div>ID: <strong style={{ fontFamily: 'monospace', fontSize: '11px' }}>{enrollResult.beneficiaryId}</strong></div>
              <div>Name: <strong>{enrollResult.fullName}</strong></div>
              <div>Aadhaar: <strong>{enrollResult.aadhaarMasked}</strong></div>
              <div>Bank: <strong>{enrollResult.bankName}</strong></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
