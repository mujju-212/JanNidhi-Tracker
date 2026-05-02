import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet, apiPost } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

export default function DTTriggerPayment() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [funds, setFunds] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [installment, setInstallment] = useState('1');
  const [amountPerBen, setAmountPerBen] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([
      apiGet('/api/district/beneficiaries'),
      apiGet('/api/district/funds')
    ])
      .then(([benRes, fundRes]) => {
        setBeneficiaries(benRes?.data || []);
        const fundData = fundRes?.data || [];
        setFunds(fundData);
        // Extract unique schemes from received funds
        const schemes = [...new Map(fundData.filter(f => f.schemeId).map(f => [f.schemeId, f])).values()];
        if (schemes.length > 0) setSelectedScheme(schemes[0].schemeId);
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  // Get unique schemes from received funds
  const schemes = [...new Map(funds.filter(f => f.schemeId).map(f => [f.schemeId, { schemeId: f.schemeId, schemeName: f.schemeName || f.schemeId }])).values()];

  const eligible = beneficiaries.filter(b =>
    (b.enrolledSchemes || []).some(s => s.schemeId === selectedScheme) && b.status === 'active'
  );

  const triggerPayments = async () => {
    if (!selectedScheme) { setError('Select a scheme first.'); return; }
    if (!amountPerBen || Number(amountPerBen) <= 0) { setError('Enter amount per beneficiary.'); return; }
    if (eligible.length === 0) { setError('No eligible beneficiaries for this scheme.'); return; }

    setLoading(true); setError(''); setResult(null);
    try {
      const schemeMeta = schemes.find(s => s.schemeId === selectedScheme);
      const res = await apiPost('/api/district/payment/trigger', {
        schemeId: selectedScheme,
        schemeName: schemeMeta?.schemeName || selectedScheme,
        installmentNumber: Number(installment),
        financialYear: '2024-25',
        amountPerBeneficiary: Number(amountPerBen),
        beneficiaryIds: eligible.map(b => b._id)
      });
      setResult(res?.data || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Step 1: Select Scheme & Payment Details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Scheme</label>
            <select value={selectedScheme} onChange={(e) => setSelectedScheme(e.target.value)} disabled={loadingList}>
              {schemes.length === 0 && <option value="">No schemes (receive funds first)</option>}
              {schemes.map(s => (
                <option key={s.schemeId} value={s.schemeId}>{s.schemeName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Installment #</label>
            <select value={installment} onChange={(e) => setInstallment(e.target.value)}>
              {[1,2,3,4].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Amount per Beneficiary (₹)</label>
            <input type="number" value={amountPerBen} onChange={(e) => setAmountPerBen(e.target.value)} placeholder="50000" />
          </div>
        </div>
      </Card>

      <Card title={`Step 2: Eligible Beneficiaries (${eligible.length})`}>
        {loadingList ? <div className="loading">Loading...</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Aadhaar</th><th>Bank</th><th>District</th><th>Status</th></tr></thead>
              <tbody>
                {eligible.length === 0 && <tr><td colSpan={5} className="helper">No eligible beneficiaries for this scheme. Enroll beneficiaries first.</td></tr>}
                {eligible.map((b) => (
                  <tr key={b._id}>
                    <td>{b.fullName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{b.aadhaarMasked}</td>
                    <td>{b.bankName}</td>
                    <td>{b.district}</td>
                    <td><Badge tone="low" label="ELIGIBLE" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Step 3: Confirm & Execute Blockchain Payment">
        <div className="helper" style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
          <div>Total eligible: <strong>{eligible.length}</strong></div>
          <div>Scheme: <strong>{selectedScheme || '-'}</strong></div>
          <div>Installment: <strong>{installment}</strong></div>
          <div>Per beneficiary: <strong>₹{amountPerBen || '0'}</strong></div>
          <div>Total payout: <strong>₹{(eligible.length * Number(amountPerBen || 0)).toLocaleString()}</strong></div>
        </div>
        <button className="btn" type="button" onClick={triggerPayments} disabled={loading || eligible.length === 0}>
          {loading ? '⏳ Recording payments on blockchain...' : '🔗 Trigger Blockchain Payment'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
      </Card>

      {result && (
        <Card title="✅ Payment Results (Blockchain Recorded)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-meta">
                <span>Successful</span>
                <strong style={{ fontSize: '24px', color: '#16a34a' }}>{result.success || 0}</strong>
              </div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-meta">
                <span>Failed / Held</span>
                <strong style={{ fontSize: '24px', color: '#dc2626' }}>{(result.failed || 0) + (result.held || 0)}</strong>
              </div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-meta">
                <span>Total Processed</span>
                <strong style={{ fontSize: '24px' }}>{result.totalBeneficiaries || 0}</strong>
              </div>
            </div>
          </div>
          <div className="helper" style={{ fontSize: '12px' }}>
            <div>Batch ID: <strong style={{ fontFamily: 'monospace' }}>{result.batchId || '-'}</strong></div>
            <div style={{ marginTop: '4px' }}>Each payment is individually recorded on the AuditLogger smart contract on Sepolia. View individual payment hashes in Payment Status.</div>
          </div>
        </Card>
      )}
    </div>
  );
}
