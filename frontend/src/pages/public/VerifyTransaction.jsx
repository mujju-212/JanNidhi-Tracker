import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function VerifyTransaction() {
  const [searchParams] = useSearchParams();
  const [txHash, setTxHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const nextHash = searchParams.get('txHash') || '';
    setTxHash(nextHash);
  }, [searchParams]);

  const verify = async () => {
    if (!txHash) { setError('Enter a transaction hash'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await apiGet(`/api/public/verify/${encodeURIComponent(txHash)}`);
      setResult(res?.data || {});
    } catch (err) { setError(err.message || 'Transaction not found'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid" style={{ gap: '16px' }}>
      <Card title="Verify Transaction on Blockchain">
        <div className="form-group">
          <label>Transaction Hash</label>
          <input placeholder="0x... or TXN-..." value={txHash} onChange={(e) => setTxHash(e.target.value)} />
        </div>
        <button className="btn" type="button" onClick={verify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        {error && <div className="alert" style={{ marginTop: '8px' }}>{error}</div>}
      </Card>

      {result && (
        <Card title="Verification Result">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Transaction ID: <strong>{result.transactionId}</strong></div>
            <div>From: {result.fromName || result.fromCode}</div>
            <div>To: {result.toName || result.toCode}</div>
            <div>Amount: Rs {result.amountCrore} Cr</div>
            <div>Scheme: {result.schemeName || result.schemeId}</div>
            <div>Status: <strong style={{ color: result.status === 'confirmed' ? '#16a34a' : '#f59e0b' }}>{result.status}</strong></div>
            <div>Blockchain Hash: <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>{result.blockchainTxHash}</span></div>
            <div>Block #: {result.blockNumber || '-'}</div>
          </div>
        </Card>
      )}
    </div>
  );
}
