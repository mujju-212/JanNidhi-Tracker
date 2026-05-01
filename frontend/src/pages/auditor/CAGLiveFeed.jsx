import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const transactions = [
  { id: 'TXN-2024-001', info: 'Finance Ministry -> MoHFW', amount: 'Rs 22186 Cr', status: 'normal' },
  { id: 'TXN-2024-002', info: 'MoHFW -> Maharashtra', amount: 'Rs 425 Cr', status: 'normal' },
  { id: 'TXN-2024-003', info: 'MoRD -> Bihar', amount: 'Rs 2.3 Cr', status: 'flagged' }
];

const flags = [
  { id: 'FLAG-2024-047', reason: 'Unknown wallet', severity: 'critical' },
  { id: 'FLAG-2024-046', reason: 'Amount mismatch', severity: 'high' }
];

export default function CAGLiveFeed() {
  return (
    <div className="grid" style={{ gap: '20px', gridTemplateColumns: '2fr 1fr' }}>
      <Card title="Live Transactions">
        <div style={{ display: 'grid', gap: '12px' }}>
          {transactions.map((tx) => (
            <div key={tx.id} className="stat-card">
              <div className="stat-meta">
                <strong>{tx.id}</strong>
                <span>{tx.info}</span>
                <span>{tx.amount}</span>
              </div>
              <Badge tone={tx.status === 'flagged' ? 'critical' : 'low'} label={tx.status === 'flagged' ? 'FLAGGED' : 'OK'} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Active Flags">
        <div style={{ display: 'grid', gap: '10px' }}>
          {flags.map((flag) => (
            <div key={flag.id} className="stat-card">
              <div className="stat-meta">
                <strong>{flag.id}</strong>
                <span>{flag.reason}</span>
              </div>
              <Badge tone={flag.severity} label={flag.severity.toUpperCase()} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
