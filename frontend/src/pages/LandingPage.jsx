import { Link } from 'react-router-dom';
import emblem from '../assets/emblem.jpg';

const features = [
  {
    icon: '🔗',
    title: 'Blockchain Verified',
    desc: 'Every fund transfer is recorded on the Ethereum Sepolia blockchain — tamper-proof and publicly verifiable.'
  },
  {
    icon: '🏛️',
    title: 'Multi-Level Governance',
    desc: 'From Centre → Ministry → State → District → Beneficiary — complete chain of custody for every rupee.'
  },
  {
    icon: '🔍',
    title: 'Real-Time Auditing',
    desc: 'CAG auditors monitor live transactions, auto-flagging suspicious patterns like over-budget releases.'
  },
  {
    icon: '👤',
    title: 'Citizen Transparency',
    desc: 'Citizens can verify their payments using Aadhaar login and check transaction hashes on Etherscan.'
  },
  {
    icon: '🛡️',
    title: 'Anti-Corruption Engine',
    desc: 'Smart contracts enforce budget limits — no entity can release more funds than allocated on-chain.'
  },
  {
    icon: '📊',
    title: 'Anonymous Public Data',
    desc: 'Anyone can explore fund flows by location or scheme without login — full transparency, zero barriers.'
  }
];

const roles = [
  { icon: '🏦', title: 'Super Admin', desc: 'Central Finance Ministry — allocates budget to ministries' },
  { icon: '🏛️', title: 'Ministry Admin', desc: 'Creates schemes, releases funds to states via MetaMask' },
  { icon: '🗺️', title: 'State Admin', desc: 'Distributes funds to districts with blockchain confirmation' },
  { icon: '📍', title: 'District Admin', desc: 'Enrolls beneficiaries, triggers blockchain-recorded payments' },
  { icon: '🔍', title: 'CAG Auditor', desc: 'Monitors all transactions, raises flags on anomalies' }
];

const flowSteps = [
  { step: '1', label: 'Centre allocates budget', detail: 'MetaMask → FundManager contract' },
  { step: '2', label: 'Ministry releases to State', detail: 'MetaMask → FundManager.releaseFunds()' },
  { step: '3', label: 'State releases to District', detail: 'MetaMask → FundManager.releaseFunds()' },
  { step: '4', label: 'District pays Beneficiary', detail: 'Server → AuditLogger.recordPayment()' },
  { step: '5', label: 'Citizen verifies on-chain', detail: 'Etherscan → Public verification' }
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e8ecf4', fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={emblem} alt="Emblem" style={{ height: '36px', borderRadius: '4px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px' }}>JanNidhi Tracker</div>
            <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>Blockchain Fund Tracking</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/public" style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none', transition: 'all 0.2s'
          }}>
            🔍 Public Access
          </Link>
          <Link to="/public/citizen-login" style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            background: 'rgba(22, 182, 164, 0.12)', color: '#16b6a4', border: '1px solid rgba(22, 182, 164, 0.25)',
            textDecoration: 'none', transition: 'all 0.2s'
          }}>
            👤 Citizen Login
          </Link>
          <Link to="/login" style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            background: 'linear-gradient(135deg, #0f4aa7, #1a6dd4)', color: '#fff',
            textDecoration: 'none', transition: 'all 0.2s', border: 'none'
          }}>
            🏛️ Government Login
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{
        padding: '100px 32px 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(15, 74, 167, 0.15) 0%, transparent 60%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: 'rgba(22, 182, 164, 0.1)', border: '1px solid rgba(22, 182, 164, 0.2)',
            fontSize: '12px', color: '#16b6a4', fontWeight: 600, letterSpacing: '0.5px',
            marginBottom: '24px', textTransform: 'uppercase'
          }}>
            🔗 Powered by Ethereum Sepolia Blockchain
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '20px',
            background: 'linear-gradient(135deg, #fff 30%, #16b6a4 70%, #0f4aa7 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Track Every Rupee.<br />Trust Every Transaction.
          </h1>
          <p style={{ fontSize: '18px', color: '#8896b0', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 36px' }}>
            JanNidhi Tracker is India's blockchain-based public fund management system.
            Every government fund transfer — from Centre to Beneficiary — is recorded on an immutable ledger,
            verifiable by anyone, anywhere.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/public" style={{
              padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
              background: 'linear-gradient(135deg, #0f4aa7, #1a6dd4)', color: '#fff',
              textDecoration: 'none', boxShadow: '0 4px 20px rgba(15, 74, 167, 0.3)'
            }}>
              Explore Public Data →
            </Link>
            <Link to="/public/verify" style={{
              padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
              background: 'rgba(255,255,255,0.06)', color: '#a0aec0',
              border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none'
            }}>
              🔗 Verify a Transaction
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FUND FLOW ═══ */}
      <section style={{ padding: '60px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>How Funds Flow</h2>
        <p style={{ textAlign: 'center', color: '#8896b0', marginBottom: '40px' }}>Every step is blockchain-verified — no exceptions</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0' }}>
          {flowSteps.map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '160px', padding: '16px', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(15, 74, 167, 0.08)', border: '1px solid rgba(15, 74, 167, 0.15)'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 8px',
                  background: 'linear-gradient(135deg, #0f4aa7, #16b6a4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '14px', color: '#fff'
                }}>{s.step}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '10px', color: '#16b6a4', marginTop: '4px', fontFamily: 'monospace' }}>{s.detail}</div>
              </div>
              {i < flowSteps.length - 1 && (
                <div style={{ fontSize: '20px', margin: '0 4px', color: '#0f4aa7' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: '60px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Platform Features</h2>
        <p style={{ textAlign: 'center', color: '#8896b0', marginBottom: '40px' }}>Built for transparency, designed for trust</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f) => (
            <div key={f.title} style={{
              padding: '24px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.2s, border-color 0.2s'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: '#8896b0', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ROLES ═══ */}
      <section style={{
        padding: '60px 32px', maxWidth: '1100px', margin: '0 auto'
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Access Portals</h2>
        <p style={{ textAlign: 'center', color: '#8896b0', marginBottom: '40px' }}>Role-based access with blockchain accountability</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {roles.map((r) => (
            <div key={r.title} style={{
              padding: '20px', borderRadius: '12px', textAlign: 'center',
              background: 'rgba(15, 74, 167, 0.06)', border: '1px solid rgba(15, 74, 167, 0.12)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{r.title}</div>
              <div style={{ fontSize: '11px', color: '#8896b0', lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {/* Login Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', maxWidth: '700px', margin: '0 auto' }}>
          <Link to="/login" style={{
            padding: '16px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none',
            background: 'linear-gradient(135deg, #0f4aa7, #1a6dd4)', color: '#fff',
            fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(15, 74, 167, 0.25)'
          }}>
            🏛️ Government Login
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Admin / Ministry / State / District / CAG</div>
          </Link>
          <Link to="/public/citizen-login" style={{
            padding: '16px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none',
            background: 'rgba(22, 182, 164, 0.1)', color: '#16b6a4',
            border: '1px solid rgba(22, 182, 164, 0.2)', fontWeight: 700, fontSize: '14px'
          }}>
            👤 Citizen Login
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Check your scheme payments</div>
          </Link>
          <Link to="/public" style={{
            padding: '16px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)', color: '#a0aec0',
            border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, fontSize: '14px'
          }}>
            🔍 Anonymous Access
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Explore without login</div>
          </Link>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section style={{
        padding: '40px 32px 60px', textAlign: 'center',
        background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ fontSize: '12px', color: '#4a5568', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Built With
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: '#8896b0' }}>
          <span>⟐ Ethereum Sepolia</span>
          <span>⟐ Solidity Smart Contracts</span>
          <span>⟐ React.js</span>
          <span>⟐ Node.js / Express</span>
          <span>⟐ MongoDB</span>
          <span>⟐ MetaMask</span>
          <span>⟐ Ethers.js</span>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: '24px 32px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        fontSize: '12px', color: '#4a5568'
      }}>
        © 2024 JanNidhi Tracker — Government of India · Blockchain-Verified Public Fund Management System
      </footer>
    </div>
  );
}
