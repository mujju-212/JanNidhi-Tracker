import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

export default function AadhaarLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarRef, setAadhaarRef] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (!aadhaar || aadhaar.length < 12) { setError('Enter valid 12-digit Aadhaar'); return; }
    setLoading(true); setError('');
    try {
      const response = await apiPost('/api/citizen/verify-aadhaar', { aadhaarNumber: aadhaar });
      setAadhaarRef(response?.data?.aadhaarRef || '');
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiPost('/api/citizen/verify-otp', { aadhaarNumber: aadhaar, aadhaarRef, otp });
      localStorage.setItem('jn_citizen_token', res?.data?.token);
      setStep(3);
      navigate(location.state?.from || '/public/citizen-dashboard', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid" style={{ gap: '16px', maxWidth: '400px', margin: '40px auto' }}>
      <Card title="Citizen Login (Aadhaar)">
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Aadhaar Number</label>
              <input placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
            </div>
            <button className="btn" type="button" onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Enter OTP</label>
              <input placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <button className="btn" type="button" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}
        {step === 3 && (
          <div className="helper">
            Verified. <Link to="/public/citizen-dashboard">Go to My Benefits</Link>
          </div>
        )}
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
      </Card>
    </div>
  );
}
