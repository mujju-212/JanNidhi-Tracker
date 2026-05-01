import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';
import { connectWallet, allocateBudgetOnChain } from '../../services/blockchain.js';

const fiscalYears = ['2024-25', '2025-26'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function SAAllocateBudget() {
  const [ministries, setMinistries] = useState([]);
  const [selectedMinistryCode, setSelectedMinistryCode] = useState('');
  const [year, setYear] = useState(fiscalYears[0]);
  const [quarter, setQuarter] = useState(quarters[0]);
  const [amount, setAmount] = useState('5000');
  const [budgetType, setBudgetType] = useState('revenue');
  const [releaseSchedule, setReleaseSchedule] = useState('immediate');
  const [schemeName, setSchemeName] = useState('General Budget Allocation');
  const [schemeRows, setSchemeRows] = useState([
    { id: 1, scheme: 'General Budget Allocation', amount: '5000', type: 'Central' }
  ]);
  const [sanctionDocHash, setSanctionDocHash] = useState('');
  const [billRef, setBillRef] = useState('AB-2024-XX');
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMinistries, setLoadingMinistries] = useState(true);
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [txStep, setTxStep] = useState('');
  const [txState, setTxState] = useState('idle');

  useEffect(() => {
    let mounted = true;
    setLoadingMinistries(true);
    apiGet('/api/superadmin/ministry/all')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        setMinistries(items);
        setSelectedMinistryCode(items[0]?.jurisdiction?.ministryCode || '');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load ministries.');
        setMinistries([]);
      })
      .finally(() => {
        if (mounted) setLoadingMinistries(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedMinistry = ministries.find(
    (item) => item?.jurisdiction?.ministryCode === selectedMinistryCode
  );

  const addSchemeRow = () => {
    setSchemeRows((prev) => [
      ...prev,
      { id: Date.now(), scheme: '', amount: '', type: '' }
    ]);
  };

  const updateSchemeRow = (id, key, value) => {
    setSchemeRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const handleConnectWallet = async () => {
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
      setWalletConnected(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to connect MetaMask');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitted(null);
    setTxState('idle');

    if (!selectedMinistry) {
      setError('Please select a ministry.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid allocation amount.');
      return;
    }

    // Step 1: Connect MetaMask if not connected
    if (!walletConnected) {
      try {
        setTxStep('Connecting MetaMask...');
        setTxState('connecting');
        await handleConnectWallet();
      } catch (err) {
        setError('Please connect MetaMask first');
        setTxStep('');
        setTxState('failed');
        return;
      }
    }

    setLoading(true);
    const transactionId = `TXN-${year}-${selectedMinistry.jurisdiction?.ministryCode}-${Date.now()}`;

    try {
      // Step 2: Sign on blockchain via MetaMask popup
      setTxStep('Waiting for MetaMask confirmation...');
      setTxState('waiting_signature');
      const bcResult = await allocateBudgetOnChain(
        selectedMinistry.walletAddress,
        Number(amount),
        transactionId,
        sanctionDocHash || billRef,
        selectedMinistry.jurisdiction?.ministry,
        selectedMinistry.jurisdiction?.ministryCode,
        selectedMinistry.budgetCapCrore || 99999
      );

      // Step 3: Save to backend DB
      setTxStep('Saving to database...');
      setTxState('saving');
      const response = await apiPost('/api/superadmin/budget/allocate', {
        ministryCode: selectedMinistry.jurisdiction?.ministryCode,
        ministryWalletAddress: selectedMinistry.walletAddress,
        totalAmountCrore: Number(amount),
        financialYear: year,
        quarter,
        sanctionDocHash: sanctionDocHash || billRef,
        blockchainTxHash: bcResult.txHash,
        blockNumber: bcResult.blockNumber
      });

      setSubmitted({
        transactionId: response?.data?.transactionId || transactionId,
        blockchainTxHash: bcResult.txHash,
        blockNumber: bcResult.blockNumber
      });
      setTxStep('');
      setTxState('success');
    } catch (err) {
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Transaction rejected in MetaMask');
      } else {
        setError(err.reason || err.message || 'Transaction failed');
      }
      setTxStep('');
      setTxState('failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Allocate Budget to Ministry">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ministry</label>
            <select
              value={selectedMinistryCode}
              onChange={(event) => setSelectedMinistryCode(event.target.value)}
              disabled={loadingMinistries}
            >
              {ministries.map((item) => (
                <option key={item._id} value={item.jurisdiction?.ministryCode}>
                  {item.jurisdiction?.ministry || item.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Financial Year</label>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              {fiscalYears.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quarter</label>
            <select value={quarter} onChange={(event) => setQuarter(event.target.value)}>
              {quarters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Total Amount (Cr)</label>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Budget Type</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label>
                <input
                  type="radio"
                  checked={budgetType === 'revenue'}
                  onChange={() => setBudgetType('revenue')}
                /> Revenue
              </label>
              <label>
                <input
                  type="radio"
                  checked={budgetType === 'capital'}
                  onChange={() => setBudgetType('capital')}
                /> Capital
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Scheme / Purpose</label>
            <input value={schemeName} onChange={(event) => setSchemeName(event.target.value)} />
          </div>

          <div className="form-group">
            <label>Scheme Breakdown</label>
            <div style={{ display: 'grid', gap: '8px' }}>
              {schemeRows.map((row) => (
                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                  <input
                    placeholder="Scheme name"
                    value={row.scheme}
                    onChange={(event) => updateSchemeRow(row.id, 'scheme', event.target.value)}
                  />
                  <input
                    placeholder="Amount"
                    type="number"
                    value={row.amount}
                    onChange={(event) => updateSchemeRow(row.id, 'amount', event.target.value)}
                  />
                  <input
                    placeholder="Type"
                    value={row.type}
                    onChange={(event) => updateSchemeRow(row.id, 'type', event.target.value)}
                  />
                </div>
              ))}
            </div>
            <button className="btn secondary" type="button" onClick={addSchemeRow} style={{ marginTop: '8px' }}>
              Add Scheme Row
            </button>
          </div>

          <div className="form-group">
            <label>Appropriation Bill Reference</label>
            <input value={billRef} onChange={(event) => setBillRef(event.target.value)} />
          </div>

          <div className="form-group">
            <label>Sanction Document Hash (Optional)</label>
            <input
              placeholder="ipfs://... or doc hash"
              value={sanctionDocHash}
              onChange={(event) => setSanctionDocHash(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Release Schedule</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label>
                <input
                  type="radio"
                  checked={releaseSchedule === 'immediate'}
                  onChange={() => setReleaseSchedule('immediate')}
                /> Immediate
              </label>
              <label>
                <input
                  type="radio"
                  checked={releaseSchedule === 'scheduled'}
                  onChange={() => setReleaseSchedule('scheduled')}
                /> Scheduled
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
            {!walletConnected ? (
              <button className="btn secondary" type="button" onClick={handleConnectWallet}>
                🦊 Connect MetaMask
              </button>
            ) : (
              <span style={{ color: '#22c55e', fontSize: '13px' }}>🦊 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            )}
            <button className="btn" type="submit" disabled={loading || loadingMinistries}>
              {loading ? (txStep || 'Processing...') : 'Confirm & Allocate on Blockchain'}
            </button>
            <button className="btn secondary" type="button" onClick={() => setSubmitted(null)}>
              Clear Result
            </button>
          </div>
        </form>
        {error ? <div className="alert" style={{ marginTop: '12px' }}>{error}</div> : null}
        {loading ? <div className="helper" style={{ marginTop: '10px' }}>{txStep || 'Processing transaction...'}</div> : null}
      </Card>

      {txState !== 'idle' ? (
        <Card title="Transaction Status">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>State: {txState.replace('_', ' ').toUpperCase()}</div>
            <div>
              {txState === 'waiting_signature' ? 'Please approve transaction in MetaMask popup.' : null}
              {txState === 'saving' ? 'MetaMask transaction successful. Saving allocation in backend...' : null}
              {txState === 'success' ? 'Allocation completed successfully.' : null}
              {txState === 'failed' ? 'Allocation failed. Please check error above.' : null}
            </div>
          </div>
        </Card>
      ) : null}

      <Card title="Preview Block">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: Finance Ministry Wallet (0x1a2b...)</div>
          <div>To: {selectedMinistry?.jurisdiction?.ministry || '-'} Wallet ({selectedMinistry?.walletAddress || '-'})</div>
          <div>Amount: Rs {amount} Cr</div>
          <div>Budget Type: {budgetType}</div>
          <div>Purpose: {schemeName}</div>
          <div>Doc Hash: {sanctionDocHash || '-'}</div>
          <div>Appropriation Bill: {billRef}</div>
          <div>Release Schedule: {releaseSchedule}</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`{
  "from": "Finance_Ministry_Wallet",
  "to": "${selectedMinistry?.walletAddress || '-'}",
  "amountCrore": "${amount}",
  "scheme": "${schemeName}",
  "docHash": "${sanctionDocHash || 'N/A'}",
  "immutable": true
}`}
          </pre>
        </div>
      </Card>

      {submitted ? (
        <Card title="Allocation Submitted">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Transaction ID: {submitted.transactionId || '-'}</div>
            <div>TX Hash: {submitted.blockchainTxHash || '-'}</div>
            <div>Block Number: {submitted.blockNumber ?? '-'}</div>
            <div>Ministry notified instantly.</div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
