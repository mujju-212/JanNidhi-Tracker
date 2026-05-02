import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

export default function DTPaymentStatus() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/payments')
      .then((res) => setPayments(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading payment status...</div>;

  const successCount = payments.filter(p => p.status === 'success').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="grid" style={{ gap: '20px' }}>
      {/* Summary stats */}
      <div className="grid two">
        <Card title="Payment Summary">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Total Payments: <strong>{payments.length}</strong></div>
            <div>Success (blockchain confirmed): <strong style={{ color: '#16a34a' }}>{successCount}</strong></div>
            <div>Failed / Held: <strong style={{ color: '#dc2626' }}>{failedCount}</strong></div>
          </div>
        </Card>
      </div>

      <Card title={`Payment Records (${payments.length})`}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Scheme</th>
                <th>Beneficiary</th>
                <th>Amount</th>
                <th>Blockchain TX</th>
                <th>Block</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && <tr><td colSpan={8} className="helper">No payments yet. Trigger payment from the Trigger Payment page.</td></tr>}
              {payments.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{p.paymentId}</td>
                  <td style={{ fontSize: '12px' }}>{p.schemeName || p.schemeId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.aadhaarMasked || '-'}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(p.amount).toLocaleString()}</td>
                  <td style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                    {p.blockchainTxHash && p.blockchainTxHash !== 'PENDING' ? (
                      <a href={`${ETHERSCAN}/tx/${p.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0f4aa7', textDecoration: 'underline' }}>
                        {p.blockchainTxHash.slice(0, 14)}...
                      </a>
                    ) : <Badge tone="medium" label={p.isHeld ? 'HELD' : 'PENDING'} />}
                  </td>
                  <td>
                    {p.blockNumber ? (
                      <a href={`${ETHERSCAN}/block/${p.blockNumber}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0f4aa7', fontSize: '12px' }}>#{p.blockNumber}</a>
                    ) : '-'}
                  </td>
                  <td>
                    <Badge
                      tone={p.status === 'success' ? 'low' : p.isHeld ? 'critical' : 'medium'}
                      label={p.isHeld ? 'HELD' : p.status?.toUpperCase()}
                    />
                    {p.holdReason && <div style={{ fontSize: '10px', color: '#dc2626' }}>{p.holdReason}</div>}
                  </td>
                  <td style={{ fontSize: '11px' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
