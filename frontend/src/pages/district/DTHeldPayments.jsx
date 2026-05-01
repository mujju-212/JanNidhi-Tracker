import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const held = [
  {
    id: 'HOLD-2024-006',
    name: 'Sita Devi',
    scheme: 'PM POSHAN',
    reason: 'Bank account inactive',
    severity: 'high'
  },
  {
    id: 'HOLD-2024-005',
    name: 'Ramesh Kumar',
    scheme: 'PM-KISAN',
    reason: 'Aadhaar mismatch',
    severity: 'medium'
  }
];

export default function DTHeldPayments() {
  return (
    <Card title="Held Payments">
      <table className="table">
        <thead>
          <tr>
            <th>Hold ID</th>
            <th>Beneficiary</th>
            <th>Scheme</th>
            <th>Reason</th>
            <th>Severity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {held.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.scheme}</td>
              <td>{item.reason}</td>
              <td>
                <Badge tone={item.severity} label={item.severity.toUpperCase()} />
              </td>
              <td>
                <button className="btn secondary" type="button">
                  Resolve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
