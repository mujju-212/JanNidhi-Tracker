import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiGet, apiPost } from '../../services/api.js';
import { connectWallet, releaseFundsOnChain, getOnChainBalance } from '../../services/blockchain.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

const progressSteps = [
  'Validate release details',
  'Connect state wallet',
  'Submit transfer to blockchain',
  'Wait for blockchain confirmation',
  'Save confirmed record',
  'Completed'
];

export default function STReleaseFunds() {
  const { user } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
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
    Promise.all([apiGet('/api/state/district/all'), apiGet('/api/state/funds')])
      .then(([districtResponse, fundsResponse]) => {
        if (!mounted) return;
        const districtItems = districtResponse?.data || [];
        setDistricts(districtItems);
        setSelectedDistrict(districtItems[0]?.jurisdiction?.districtCode || '');

        const uniqueSchemes = [
          ...new Map(
            (fundsResponse?.data || [])
              .filter((item) => item.schemeId)
              .map((item) => [item.schemeId, { schemeId: item.schemeId, schemeName: item.schemeName || item.schemeId }])
          ).values()
        ];
        setSchemes(uniqueSchemes);
        setSelectedScheme(uniqueSchemes[0]?.schemeId || '');
      })
      .catch((err) => { if (mounted) setError(err.message || 'Unable to load.'); })
      .finally(() => { if (mounted) setLoadingMeta(false); });
    return () => { mounted = false; };
  }, []);

  const district = useMemo(() => districts.find((d) => d.jurisdiction?.districtCode === selectedDistrict), [districts, selectedDistrict]);
  const scheme = useMemo(() => schemes.find((s) => s.schemeId === selectedScheme), [schemes, selectedScheme]);
  const expectedWalletAddress = (user?.walletAddress || '').toLowerCase();

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

  const release = async () => {
    if (!district || !scheme) { setError('Please select district and scheme.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount.'); return; }
    if (!walletConnected) { setError('Please connect MetaMask wallet first.'); return; }
    if (expectedWalletAddress && walletAddress.toLowerCase() !== expectedWalletAddress) {
      setError('Connected wallet does not match your state wallet. Reconnect with the funded state wallet and try again.');
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

      // Step 2: Submit to blockchain via MetaMask
      setTxState('submitting');
      setTxStep('Submitting signed transaction to blockchain...');
      setTxStepIndex(2);

      const txId = `TXN-${Date.now()}-${scheme.schemeId}-${district.jurisdiction?.districtCode}`;

      setTxState('confirming');
      setTxStep('Waiting for blockchain confirmation...');
      setTxStepIndex(3);

      const chainResult = await releaseFundsOnChain(
        district.walletAddress,
        Number(amount),
        txId,
        scheme.schemeId,
        ''
      );

      // Step 3: Save to DB ONLY after blockchain success
      setTxState('saving');
      setTxStep('Blockchain confirmed! Saving record...');
      setTxStepIndex(4);

      const response = await apiPost('/api/state/funds/release', {
        transactionId: txId,
        districtCode: district.jurisdiction?.districtCode,
        districtWalletAddress: district.walletAddress,
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
      const message = err.reason || err.message || 'Fund release failed.';
      setError(message);
      setTxState('failed');
      setTxStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release Funds to District">
        <div className="form-group">
          <label>District</label>
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={loadingMeta}>
            {districts.map((d) => (
              <option key={d._id} value={d.jurisdiction?.districtCode}>{d.jurisdiction?.district}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Scheme</label>
          <select value={selectedScheme} onChange={(e) => setSelectedScheme(e.target.value)} disabled={loadingMeta}>
            {schemes.map((s) => (
              <option key={s.schemeId} value={s.schemeId}>{s.schemeName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount in Crores" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          {!walletConnected ? (
            <button className="btn secondary" type="button" onClick={handleConnectWallet} disabled={connecting}>
              {connecting ? '⏳ Connecting...' : '🔗 Connect MetaMask'}
            </button>
          ) : (
            <div style={{ display: 'grid', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#475569' }}>
                Assigned state wallet: {user?.walletAddress || 'Not configured'}
              </span>
              <span style={{ color: '#16a34a', fontSize: '13px' }}>
                ✅ Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </span>
              {onChainBalance !== null && (
                <span style={{ fontSize: '12px', color: onChainBalance > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  On-chain balance: {onChainBalance} Cr {onChainBalance === 0 ? '— ⚠️ Ask Ministry to release funds to your wallet' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <button className="btn" type="button" onClick={release} disabled={loading || loadingMeta || !walletConnected}>
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
              <div>TX Hash: <a href={`${ETHERSCAN}/tx/${txMeta.blockchainTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4aa7', fontFamily: 'monospace', wordBreak: 'break-all' }}>{txMeta.blockchainTxHash}</a></div>
              <div>Block: <a href={`${ETHERSCAN}/block/${txMeta.blockNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4aa7' }}>#{txMeta.blockNumber}</a></div>
            </div>
          )}
          {txState === 'failed' && <div className="alert" style={{ marginTop: '8px' }}>❌ Transaction failed. No data saved to database.</div>}
        </Card>
      )}

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: State Wallet {walletAddress ? `(${walletAddress.slice(0, 10)}...)` : ''}</div>
          <div>To: {district?.jurisdiction?.district || '-'} ({district?.walletAddress?.slice(0, 10) || '-'}...)</div>
          <div>Scheme: {scheme?.schemeName || '-'}</div>
          <div>Amount: ₹{amount || '0'} Cr</div>
        </div>
      </Card>
    </div>
  );
}
