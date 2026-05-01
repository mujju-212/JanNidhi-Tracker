import Card from '../../components/common/Card.jsx';

const complaints = [
  { id: 'COMP-2024-011', scheme: 'PM-KISAN', status: 'open', daysLeft: 5 },
  { id: 'COMP-2024-012', scheme: 'PM POSHAN', status: 'under_review', daysLeft: 2 }
];

export default function DTComplaints() {
  return (
    <Card title="Citizen Complaints">
      <table className="table">
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Scheme</th>
            <th>Status</th>
            <th>Days Left</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.scheme}</td>
              <td>{item.status}</td>
              <td>{item.daysLeft}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
