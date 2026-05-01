import Card from '../../components/common/Card.jsx';

const funds = [
  { ministry: 'MoHFW', scheme: 'Ayushman Bharat', amount: '425', date: '01 Apr 2024', status: 'confirmed' },
  { ministry: 'MoEdu', scheme: 'PM POSHAN', amount: '380', date: '03 Apr 2024', status: 'confirmed' }
];

export default function STViewFunds() {
  return (
    <Card title="Funds Received">
      <table className="table">
        <thead>
          <tr>
            <th>Ministry</th>
            <th>Scheme</th>
            <th>Amount (Cr)</th>
            <th>Release Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund) => (
            <tr key={`${fund.ministry}-${fund.scheme}`}>
              <td>{fund.ministry}</td>
              <td>{fund.scheme}</td>
              <td>Rs {fund.amount}</td>
              <td>{fund.date}</td>
              <td>{fund.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
