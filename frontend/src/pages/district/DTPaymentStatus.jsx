import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const batches = [
  {
    id: 'BATCH-2024-11',
    scheme: 'PM-KISAN',
    total: 420,
    success: 398,
    failed: 22,
    status: 'completed',
    date: '20 May 2024'
  },
  {
    id: 'BATCH-2024-10',
    scheme: 'PM POSHAN',
    total: 280,
    success: 256,
    failed: 24,
    status: 'processing',
    date: '18 May 2024'
  }
];

const statusTone = (status) => (status === 'completed' ? 'low' : 'medium');

export default function DTPaymentStatus() {
  return (
    <Card title="Payment Batch Status">
      <table className="table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Scheme</th>
            <th>Total</th>
            <th>Success</th>
            <th>Failed</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td>{batch.id}</td>
              <td>{batch.scheme}</td>
              <td>{batch.total}</td>
              <td>{batch.success}</td>
              <td>{batch.failed}</td>
              <td>
                <Badge tone={statusTone(batch.status)} label={batch.status.toUpperCase()} />
              </td>
              <td>{batch.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
