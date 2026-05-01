import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const flags = [
  { id: 'FLAG-2024-MH-01', type: 'high', issue: 'Delayed release', status: 'open' },
  { id: 'FLAG-2024-MH-02', type: 'medium', issue: 'UC pending', status: 'open' }
];

export default function STFlagCenter() {
  return (
    <Card title="State Flag Center">
      <table className="table">
        <thead>
          <tr>
            <th>Flag ID</th>
            <th>Type</th>
            <th>Issue</th>
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
              <td>{flag.issue}</td>
              <td>{flag.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
