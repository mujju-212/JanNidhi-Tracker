import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const flags = [
  { id: 'FLAG-2024-047', type: 'critical', transaction: 'TXN-2024-011', status: 'awaiting_response' },
  { id: 'FLAG-2024-046', type: 'high', transaction: 'TXN-2024-010', status: 'under_review' },
  { id: 'FLAG-2024-045', type: 'medium', transaction: 'TXN-2024-009', status: 'resolved' }
];

export default function CAGFlagManagement() {
  return (
    <Card title="Flag Management">
      <table className="table">
        <thead>
          <tr>
            <th>Flag ID</th>
            <th>Type</th>
            <th>Transaction</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.id}</td>
              <td>
                <Badge tone={flag.type} label={flag.type.toUpperCase()} />
              </td>
              <td>{flag.transaction}</td>
              <td>{flag.status.replace('_', ' ')}</td>
              <td>
                <button className="btn secondary">Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
