import Card from '../../components/common/Card.jsx';

const funds = [
  { scheme: 'PM POSHAN', amount: '45', date: '05 Apr 2024', status: 'confirmed' },
  { scheme: 'PM-KISAN', amount: '22', date: '08 Apr 2024', status: 'confirmed' }
];

export default function DTViewFunds() {
  return (
    <Card title="Funds Received">
      <table className="table">
        <thead>
          <tr>
            <th>Scheme</th>
            <th>Amount (Cr)</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((item) => (
            <tr key={item.scheme}>
              <td>{item.scheme}</td>
              <td>Rs {item.amount}</td>
              <td>{item.date}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
