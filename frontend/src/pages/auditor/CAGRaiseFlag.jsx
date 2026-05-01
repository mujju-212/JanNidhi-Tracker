import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiPost } from '../../services/api.js';

const flagTypes = ['critical', 'high', 'medium', 'info'];
const codes = [
  'AMOUNT_MISMATCH', 'UNKNOWN_WALLET', 'SPEED_ANOMALY',
  'DUPLICATE_PAYMENT', 'ROUND_FIGURE', 'INACTIVE_SCHEME',
  'DEADLINE_BREACH', 'CITIZEN_COMPLAINT', 'OTHER'
];

export default function CAGRaiseFlag() {
  const [transactionId, setTransactionId] = useState('');
  const [flagType, setFlagType] = useState('high');
  const [flagCode, setFlagCode] = useState(codes[0]);
  const [flagReason, setFlagReason] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!transactionId || !flagReason) {
      setError('Transaction ID and reason are required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost('/api/auditor/flag/raise', {
        transactionId,
        flagType,
        flagCode,
        flagReason,
        responseDeadlineDays: Number(deadlineDays) || 7
      });
      setResult(res?.data || {});
      setTransactionId('');
      setFlagReason('');
    } catch (err) {
      setError(err.message || 'Failed to raise flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '16px' }}>
      <Card title="Raise Manual Flag">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transaction ID</label>
            <input placeholder="TXN-2024-MOHFW-..." value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Flag Type (Severity)</label>
            <select value={flagType} onChange={(e) => setFlagType(e.target.value)}>
              {flagTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Flag Code</label>
            <select value={flagCode} onChange={(e) => setFlagCode(e.target.value)}>
              {codes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reason / Description</label>
            <textarea rows={4} placeholder="Describe the issue in detail..."
              value={flagReason} onChange={(e) => setFlagReason(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Response Deadline (days)</label>
            <input type="number" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Raising Flag...' : 'Raise Flag'}
          </button>
        </form>
        {error && <div className="alert" style={{ marginTop: '12px' }}>{error}</div>}
      </Card>

      {result && (
        <Card title="Flag Raised Successfully">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Flag ID: <strong>{result.flagId}</strong></div>
            <div>Deadline: <strong>{new Date(result.deadline).toLocaleDateString()}</strong></div>
            <div>The responsible entity has been notified and must respond before the deadline.</div>
          </div>
        </Card>
      )}
    </div>
  );
}
