import Card from '../../components/common/Card.jsx';

const transactions = [
  { id: 'TXN-2024-001', state: 'Maharashtra', scheme: 'Ayushman Bharat', amount: '425', status: 'confirmed' },
  { id: 'TXN-2024-002', state: 'UP', scheme: 'PM POSHAN', amount: '380', status: 'confirmed' },
  { id: 'TXN-2024-003', state: 'Bihar', scheme: 'NHM', amount: '210', status: 'flagged' }
];

export default function MinTransactions() {
  return (
    <Card title="Ministry Transactions">
      <table className="table">
        <thead>
          <tr>
            <th>TXN ID</th>
            <th>State</th>
            <th>Scheme</th>
            <th>Amount (Cr)</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.state}</td>
              <td>{tx.scheme}</td>
              <td>Rs {tx.amount}</td>
              <td>{tx.status}</td>
              <td>
                <button className="btn secondary">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
