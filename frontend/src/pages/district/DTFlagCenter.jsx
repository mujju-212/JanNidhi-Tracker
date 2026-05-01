import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const flags = [
  { id: 'FLAG-2024-PUNE-01', type: 'high', reason: 'Duplicate Aadhaar detected', status: 'open' },
  { id: 'FLAG-2024-PUNE-02', type: 'medium', reason: 'Payment delayed', status: 'open' }
];

export default function DTFlagCenter() {
  return (
    <Card title="District Flag Center">
      <table className="table">
        <thead>
          <tr>
            <th>Flag ID</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.id}</td>
              <td>
                <Badge tone={flag.type} label={flag.type.toUpperCase()} />
              </td>
              <td>{flag.reason}</td>
              <td>{flag.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
