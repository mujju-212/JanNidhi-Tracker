import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const transactions = [
  {
    id: 'DTXN-2024-011',
    from: 'State Treasury',
    to: 'District Treasury',
    amount: 480,
    scheme: 'PM-KISAN',
    status: 'confirmed',
    date: '15 Apr 2024'
  },
  {
    id: 'DTXN-2024-012',
    from: 'District Treasury',
    to: 'Panchayat Ambegaon',
    amount: 120,
    scheme: 'PM POSHAN',
    status: 'flagged',
    date: '20 Apr 2024'
  }
];

const statusTone = (status) => (status === 'confirmed' ? 'low' : 'medium');

export default function DTTransactions() {
  return (
    <Card title="District Transactions">
      <table className="table">
        <thead>
          <tr>
            <th>TXN ID</th>
            <th>From</th>
            <th>To</th>
            <th>Amount (Cr)</th>
            <th>Scheme</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
              <td>Rs {tx.amount}</td>
              <td>{tx.scheme}</td>
              <td>
                <Badge tone={statusTone(tx.status)} label={tx.status.toUpperCase()} />
              </td>
              <td>{tx.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
