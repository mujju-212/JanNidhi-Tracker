import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiGet, apiPost } from '../../services/api.js';
import { connectWallet, releaseFundsOnChain, getOnChainBalance } from '../../services/blockchain.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

const progressSteps = [
  'Validate release details',
  'Connect ministry wallet',
  'Submit transfer to blockchain',
  'Wait for blockchain confirmation',
  'Save confirmed record',
  'Completed'
];

export default function MinReleaseFunds() {
  const { user } = useAuth();
  const [states, setStates] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txStep, setTxStep] = useState('');
  const [txStepIndex, setTxStepIndex] = useState(-1);
  const [txState, setTxState] = useState('idle');
  const [txMeta, setTxMeta] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [onChainBalance, setOnChainBalance] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoadingMeta(true);
    Promise.all([apiGet('/api/ministry/state/all'), apiGet('/api/ministry/scheme/all')])
      .then(([stateResponse, schemeResponse]) => {
        if (!mounted) return;
        const stateItems = stateResponse?.data || [];
        const schemeItems = schemeResponse?.data || [];
        setStates(stateItems);
        setSchemes(schemeItems);
        setSelectedState(stateItems[0]?.jurisdiction?.stateCode || '');
        setSelectedScheme(schemeItems[0]?.schemeId || '');
      })
      .catch((err) => { if (mounted) setError(err.message || 'Unable to load.'); })
      .finally(() => { if (mounted) setLoadingMeta(false); });
    return () => { mounted = false; };
  }, []);

  const state = useMemo(() => states.find((s) => s.jurisdiction?.stateCode === selectedState), [states, selectedState]);
  const scheme = useMemo(() => schemes.find((s) => s.schemeId === selectedScheme), [schemes, selectedScheme]);
  const expectedWalletAddress = (user?.walletAddress || '').toLowerCase();

  // Connect wallet, sync to backend DB, and read on-chain balance
  const handleConnectWallet = async () => {
    if (connecting || walletConnected) return;
    setConnecting(true);
    setError('');
    try {
      const addr = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(addr);
      // Read on-chain balance
      try {
        const bal = await getOnChainBalance(addr);
        setOnChainBalance(bal);
      } catch { setOnChainBalance(null); }
    } catch (err) {
      setError(err.message || 'Unable to connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const releaseFunds = async () => {
    if (!state || !scheme) { setError('Please select a state and scheme.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount.'); return; }
    if (!walletConnected) { setError('Please connect MetaMask wallet first.'); return; }
    if (expectedWalletAddress && walletAddress.toLowerCase() !== expectedWalletAddress) {
      setError('Connected wallet does not match your ministry wallet. Reconnect with the funded ministry wallet and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setTxMeta(null);
    setTxState('validating');
    setTxStep('Validating release details...');
    setTxStepIndex(0);

    try {
      setTxState('submitting');
      setTxStep('Submitting signed transaction to blockchain...');
      setTxStepIndex(2);

      const txId = `TXN-${Date.now()}-${scheme.schemeId}-${state.jurisdiction?.stateCode}`;

      setTxState('confirming');
      setTxStep('Waiting for blockchain confirmation (this may take 15-30 seconds)...');
      setTxStepIndex(3);

      const chainResult = await releaseFundsOnChain(
        state.walletAddress,
        Number(amount),
        txId,
        scheme.schemeId,
        ''
      );

      setTxState('saving');
      setTxStep('Blockchain confirmed! Saving record to database...');
      setTxStepIndex(4);

      await apiPost('/api/ministry/funds/release', {
        transactionId: txId,
        stateCode: state.jurisdiction?.stateCode,
        stateWalletAddress: state.walletAddress,
        amountCrore: Number(amount),
        schemeId: scheme.schemeId,
        schemeName: scheme.schemeName,
        ucDocHash: null,
        blockchainTxHash: chainResult.txHash,
        blockNumber: chainResult.blockNumber
      });

      setTxMeta({ blockchainTxHash: chainResult.txHash, blockNumber: chainResult.blockNumber, transactionId: txId });
      setTxState('success');
      setTxStep('Funds released and confirmed on blockchain.');
      setTxStepIndex(5);
      setSuccess('Funds released successfully with blockchain confirmation.');
      setAmount('');
    } catch (err) {
      setError(err.reason || err.message || 'Unable to release funds.');
      setTxState('failed');
      setTxStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release Funds to State">
        <div className="form-group">
          <label>Select Scheme</label>
          <select value={selectedScheme} onChange={(e) => setSelectedScheme(e.target.value)} disabled={loadingMeta}>
            {schemes.length === 0 && <option value="">No schemes (create one first)</option>}
            {schemes.map((item) => (
              <option key={item.schemeId} value={item.schemeId}>{item.schemeName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Select State</label>
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={loadingMeta}>
            {states.length === 0 && <option value="">No states (create one first)</option>}
            {states.map((item) => (
              <option key={item._id} value={item.jurisdiction?.stateCode}>{item.jurisdiction?.state}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount in Crores" />
        </div>

        {/* Wallet connection — separate button, NOT inside release flow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          {!walletConnected ? (
            <button className="btn secondary" type="button" onClick={handleConnectWallet} disabled={connecting}>
              {connecting ? '⏳ Connecting...' : '🔗 Connect MetaMask'}
            </button>
          ) : (
            <div style={{ display: 'grid', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#475569' }}>
                Assigned ministry wallet: {user?.walletAddress || 'Not configured'}
              </span>
              <span style={{ color: '#16a34a', fontSize: '13px' }}>
                ✅ Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </span>
              {onChainBalance !== null && (
                <span style={{ fontSize: '12px', color: onChainBalance > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  On-chain balance: {onChainBalance} Cr {onChainBalance === 0 ? '— ⚠️ Ask Super Admin to allocate budget to this wallet' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <button className="btn" type="button" onClick={releaseFunds} disabled={loading || loadingMeta || !walletConnected}>
          {loading ? (txStep || 'Processing...') : '🔗 Release Funds on Blockchain'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
        {success && <div className="helper" style={{ marginTop: '8px' }}>{success}</div>}
      </Card>

      {txState !== 'idle' && (
        <Card title="Transaction Progress">
          <div style={{ display: 'grid', gap: '8px' }}>
            {progressSteps.map((label, i) => {
              const isDone = i < txStepIndex;
              const isActive = i === txStepIndex && txState !== 'failed';
              return (
                <div key={label} style={{ fontSize: '13px', opacity: isDone || isActive ? 1 : 0.4 }}>
                  {isDone ? '✅' : isActive ? '⏳' : '⬜'} {label}
                </div>
              );
            })}
          </div>
          {txMeta?.blockchainTxHash && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(22, 163, 74, 0.06)', borderRadius: '8px', fontSize: '12px' }}>
              <div>TX Hash: <a href={`${ETHERSCAN}/tx/${txMeta.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#0f4aa7', fontFamily: 'monospace', wordBreak: 'break-all' }}>{txMeta.blockchainTxHash}</a></div>
              <div>Block: <a href={`${ETHERSCAN}/block/${txMeta.blockNumber}`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#0f4aa7' }}>#{txMeta.blockNumber}</a></div>
            </div>
          )}
          {txState === 'failed' && <div className="alert" style={{ marginTop: '8px' }}>❌ Transaction failed. No data saved to database.</div>}
        </Card>
      )}

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: Ministry Wallet {walletAddress ? `(${walletAddress.slice(0, 10)}...)` : ''}</div>
          <div>To: {state?.jurisdiction?.state || '-'} ({state?.walletAddress?.slice(0, 10) || '-'}...)</div>
          <div>Scheme: {scheme?.schemeName || '-'}</div>
          <div>Amount: ₹{amount || '0'} Cr</div>
        </div>
      </Card>
    </div>
  );
}
