import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Globe2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const roles = [
  { value: 'super_admin', label: 'Super Admin (Finance Ministry)' },
  { value: 'ministry_admin', label: 'Ministry Admin' },
  { value: 'state_admin', label: 'State Admin' },
  { value: 'district_admin', label: 'District Admin' },
  { value: 'central_cag', label: 'CAG Auditor' },
  { value: 'citizen', label: 'Citizen' }
];

const roleRoutes = {
  super_admin: '/superadmin/dashboard',
  ministry_admin: '/ministry/dashboard',
  state_admin: '/state/dashboard',
  district_admin: '/district/dashboard',
  central_cag: '/auditor/dashboard',
  citizen: '/public/citizen-dashboard'
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('super_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    setError('');
    if (!email || !password) {
      setError('Enter email and password first.');
      return;
    }
    setOtpSent(true);
  };

  const handleLogin = () => {
    setError('');
    if (!otpSent || !otp) {
      setError('Enter the OTP sent to your email.');
      return;
    }
    login({
      role,
      name: roles.find((item) => item.value === role)?.label || 'User',
      email
    });
    navigate(roleRoutes[role] || '/login');
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div>
          <h1>JanNidhi Tracker</h1>
          <p>
            Real-time transparency for public fund management. Track every
            allocation, release, and beneficiary payment from one trusted view.
          </p>
          <div style={{ display: 'grid', gap: '12px', marginTop: '28px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ShieldCheck size={18} color="#0f4aa7" />
              Immutable blockchain audit trail
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Sparkles size={18} color="#16b6a4" />
              Automated anomaly flags in seconds
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Globe2 size={18} color="#0f4aa7" />
              Public transparency with citizen verification
            </div>
          </div>
        </div>
        <p className="helper">Secure access for government officials only.</p>
      </div>

      <div className="login-card">
        <h2>Login Securely</h2>
        <p className="helper">Select your role and verify your OTP.</p>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Government Email</label>
          <input
            placeholder="official@gov.in"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {otpSent ? (
          <div className="form-group">
            <label>OTP</label>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
            <span className="helper">Dev OTP: 123456</span>
          </div>
        ) : null}

        {error ? <div className="alert">{error}</div> : null}

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button className="btn secondary" type="button" onClick={handleSendOtp}>
            Send OTP
          </button>
          <button className="btn" type="button" onClick={handleLogin}>
            Login Securely
          </button>
        </div>

        <div style={{ marginTop: '18px' }}>
          <a className="helper" href="/public">
            Track your benefit without login →
          </a>
        </div>
      </div>
    </div>
  );
}
