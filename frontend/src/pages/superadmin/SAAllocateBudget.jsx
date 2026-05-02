import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';
const fiscalYears = ['2024-25', '2025-26'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function SAAllocateBudget() {
  const [ministries, setMinistries] = useState([]);
  const [selectedMinistryCode, setSelectedMinistryCode] = useState('');
  const [year, setYear] = useState(fiscalYears[0]);
  const [quarter, setQuarter] = useState(quarters[0]);
  const [amount, setAmount] = useState('50');
  const [schemeName, setSchemeName] = useState('General Budget Allocation');
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMinistries, setLoadingMinistries] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    apiGet('/api/superadmin/ministry/all')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        setMinistries(items);
        setSelectedMinistryCode(items[0]?.jurisdiction?.ministryCode || '');
      })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoadingMinistries(false); });
    return () => { mounted = false; };
  }, []);

  const selectedMinistry = ministries.find(
    (item) => item?.jurisdiction?.ministryCode === selectedMinistryCode
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitted(null);

    if (!selectedMinistry) { setError('Please select a ministry.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount.'); return; }

    setLoading(true);
    try {
      // Server-side allocation — backend has deployer key (contract superAdmin)
      // No MetaMask needed! Backend registers + allocates on-chain automatically
      const response = await apiPost('/api/superadmin/budget/allocate', {
        ministryCode: selectedMinistry.jurisdiction?.ministryCode,
        ministryWalletAddress: selectedMinistry.walletAddress,
        totalAmountCrore: Number(amount),
        financialYear: year,
        quarter,
        sanctionDocHash: schemeName
      });
      setSubmitted(response?.data || {});
    } catch (err) {
      setError(err.message || 'Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Allocate Budget to Ministry (Blockchain Verified)">
        <div className="helper" style={{ marginBottom: '12px', fontSize: '12px', padding: '8px', background: 'rgba(22, 163, 74, 0.06)', borderRadius: '8px' }}>
          ✅ Allocation is done <strong>server-side</strong> using the contract deployer key. No MetaMask needed — the backend signs the on-chain transaction automatically.
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ministry</label>
            <select
              value={selectedMinistryCode}
              onChange={(e) => setSelectedMinistryCode(e.target.value)}
              disabled={loadingMinistries}
            >
              {ministries.length === 0 && <option value="">No ministries created yet</option>}
              {ministries.map((item) => (
                <option key={item._id} value={item.jurisdiction?.ministryCode}>
                  {item.jurisdiction?.ministry || item.fullName}
                </option>
              ))}
            </select>
          </div>

          {selectedMinistry && (
            <div className="helper" style={{ fontSize: '12px', marginBottom: '12px' }}>
              <div>Wallet: <strong style={{ fontFamily: 'monospace' }}>{selectedMinistry.walletAddress}</strong></div>
              <div>Budget Cap: <strong>{selectedMinistry.budgetCapCrore || '-'} Cr</strong></div>
            </div>
          )}

          <div className="form-group">
            <label>Financial Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {fiscalYears.map((fy) => <option key={fy} value={fy}>{fy}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Quarter</label>
            <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
              {quarters.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Amount (Cr)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Purpose / Scheme</label>
            <input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} />
          </div>

          <button className="btn" type="submit" disabled={loading || loadingMinistries}>
            {loading ? '⏳ Allocating on blockchain...' : '🔗 Allocate on Blockchain'}
          </button>
        </form>
        {error && <div className="alert" style={{ marginTop: '12px' }}>{error}</div>}
      </Card>

      <Card title="Preview">
        <div className="helper" style={{ display: 'grid', gap: '6px' }}>
          <div>To: {selectedMinistry?.jurisdiction?.ministry || '-'}</div>
          <div>Wallet: <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedMinistry?.walletAddress || '-'}</span></div>
          <div>Amount: ₹{amount || '0'} Cr</div>
          <div>Year: {year} / {quarter}</div>
          <div>Purpose: {schemeName}</div>
        </div>
      </Card>

      {submitted && (
        <Card title="✅ Allocation Confirmed">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Transaction ID: <strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{submitted.transactionId}</strong></div>
            <div>Status: <strong style={{ color: '#16a34a' }}>{submitted.status?.toUpperCase()}</strong></div>
            <div>Allocated To: <strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{submitted.allocatedTo}</strong></div>
            {submitted.blockchainTxHash && submitted.blockchainTxHash !== 'PENDING' && (
              <>
                <div>TX Hash: <a href={`${ETHERSCAN}/tx/${submitted.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#0f4aa7', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{submitted.blockchainTxHash}</a></div>
                <div>Block: <a href={`${ETHERSCAN}/block/${submitted.blockNumber}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#0f4aa7' }}>#{submitted.blockNumber}</a></div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
