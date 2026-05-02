import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Globe2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiPost } from '../../services/api.js';
import slide1 from '../../assets/slide1.png';
import slide2 from '../../assets/slide2.png';
import slide3 from '../../assets/slide3.png';
import slide4 from '../../assets/slide4.png';
import slide5 from '../../assets/slide5.png';

const roles = [
  { value: 'super_admin', label: 'Super Admin (Finance Ministry)' },
  { value: 'ministry_admin', label: 'Ministry Admin' },
  { value: 'state_admin', label: 'State Admin' },
  { value: 'district_admin', label: 'District Admin' },
  { value: 'central_cag', label: 'CAG Auditor' },
  { value: 'state_auditor', label: 'State Auditor' },
  { value: 'citizen', label: 'Citizen' }
];

const roleRoutes = {
  super_admin: '/superadmin/dashboard',
  ministry_admin: '/ministry/dashboard',
  state_admin: '/state/dashboard',
  district_admin: '/district/dashboard',
  central_cag: '/auditor/dashboard',
  state_auditor: '/auditor/dashboard',
  citizen: '/public/citizen-dashboard'
};

const slides = [
  {
    title: 'Transparent Fund Flow Across India',
    desc: 'Track how public funds move from central ministries to states, districts, and beneficiaries in one unified view.',
    image: slide1
  },
  {
    title: 'Immutable Blockchain Audit Trail',
    desc: 'Every transaction is securely recorded and cannot be altered, ensuring complete accountability and trust.',
    image: slide2
  },
  {
    title: 'Real-Time Fund Monitoring',
    desc: 'Monitor allocations, releases, and utilization instantly with live dashboards and analytics.',
    image: slide3
  },
  {
    title: 'Smart Anomaly & Fraud Detection',
    desc: 'Automatically detect suspicious transactions and flag irregularities before they become critical issues.',
    image: slide4
  },
  {
    title: 'Citizen-Centric Transparency',
    desc: 'Citizens can verify benefits, track payments, and ensure rightful delivery without special access.',
    image: slide5
  }
];

const demoCredentials = [
  {
    label: 'Demo Super Admin',
    role: 'super_admin',
    email: 'admin@finmin.gov.in',
    password: 'Admin@1234'
  },
  {
    label: 'Education Ministry',
    role: 'ministry_admin',
    email: 'secretary@education.gov.in',
    password: 'Ministry@1234'
  },
  {
    label: 'Karnataka State',
    role: 'state_admin',
    email: 'finance@karnataka.gov.in',
    password: 'State@1234'
  },
  {
    label: 'Bengaluru District',
    role: 'district_admin',
    email: 'collector@bengaluru.gov.in',
    password: 'District@1234'
  },
  {
    label: 'Demo CAG',
    role: 'central_cag',
    email: 'cag@cagindia.gov.in',
    password: 'CAG@12345'
  }
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('super_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSendOtp = async () => {
    setError('');
    setStatus('');

    if (role === 'citizen') {
      navigate('/public/citizen-login');
      return;
    }

    if (!email || !password) {
      setError('Enter email and password first.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/api/auth/login', { email, password });
      setOtpSent(true);
      setPendingUserId(response?.data?.userId || null);
      setStatus(response?.message || 'OTP sent to registered phone.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
      setOtpSent(false);
      setPendingUserId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setStatus('');
    if (!otpSent || !otp) {
      setError('Enter the OTP sent to your phone.');
      return;
    }
    if (!pendingUserId) {
      setError('Start with Send OTP first.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/api/auth/verify-otp', {
        userId: pendingUserId,
        otp
      });
      const payload = response?.data || {};
      if (!payload.token || !payload.user) {
        throw new Error('Invalid login response.');
      }
      login({ user: payload.user, token: payload.token });
      const nextRole = payload.role || payload.user.role || role;
      navigate(roleRoutes[nextRole] || '/login');
    } catch (err) {
      setError(err.message || 'Unable to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const applyDemo = (item) => {
    setRole(item.role);
    setEmail(item.email);
    setPassword(item.password);
    setOtp('');
    setOtpSent(false);
    setPendingUserId(null);
    setStatus(`Loaded ${item.label} credentials.`);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-slide" key={activeSlide}>
          <img
            src={slides[activeSlide].image}
            alt=""
            className="login-slide-image"
          />
          <div className="login-slide-overlay" />
          <div className="login-slide-content">
            <div className="login-slide-kicker">JanNidhi Tracker</div>
            <h2>{slides[activeSlide].title}</h2>
            <p>{slides[activeSlide].desc}</p>
            <div className="login-slide-icons">
              <div>
                <ShieldCheck size={16} />
                Trusted audit
              </div>
              <div>
                <Sparkles size={16} />
                Smart flags
              </div>
              <div>
                <Globe2 size={16} />
                Citizen view
              </div>
            </div>
          </div>
          <div className="login-slide-dots">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={index === activeSlide ? 'dot active' : 'dot'}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
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
          <label>Quick Demo Login</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {demoCredentials.map((item) => (
              <button
                key={item.label}
                className="btn secondary"
                type="button"
                style={{ fontSize: '12px', padding: '6px 10px' }}
                onClick={() => applyDemo(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="helper">Use Education Ministry, Karnataka State, and Bengaluru District demo buttons to auto-fill the correct credentials.</span>
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
            <span className="helper">Check server logs for the mock OTP.</span>
          </div>
        ) : null}

        {status ? <div className="helper">{status}</div> : null}

        {error ? <div className="alert">{error}</div> : null}

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button className="btn secondary" type="button" onClick={handleSendOtp} disabled={loading}>
            Send OTP
          </button>
          <button className="btn" type="button" onClick={handleLogin} disabled={loading}>
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
