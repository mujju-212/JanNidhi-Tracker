import Card from '../../components/common/Card.jsx';

const transactions = [
  { id: 'TXN-2024-MH-011', district: 'Pune', scheme: 'PM POSHAN', amount: '45', status: 'confirmed' },
  { id: 'TXN-2024-MH-012', district: 'Nagpur', scheme: 'NHM', amount: '22', status: 'pending' }
];

export default function STTransactions() {
  return (
    <Card title="State Transactions">
      <table className="table">
        <thead>
          <tr>
            <th>TXN ID</th>
            <th>District</th>
            <th>Scheme</th>
            <th>Amount (Cr)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.district}</td>
              <td>{tx.scheme}</td>
              <td>Rs {tx.amount}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
