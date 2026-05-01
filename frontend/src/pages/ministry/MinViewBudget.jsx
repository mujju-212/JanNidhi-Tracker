import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const allocations = [
  {
    id: 'ALLOC-2024-011',
    scheme: 'Ayushman Bharat',
    amount: 7200,
    released: 5600,
    balance: 1600,
    status: 'active',
    hash: '0xa3f9c2e8b4d7...',
    date: '01 Apr 2024'
  },
  {
    id: 'ALLOC-2024-012',
    scheme: 'PM POSHAN',
    amount: 6000,
    released: 4200,
    balance: 1800,
    status: 'active',
    hash: '0xa7f4c2e8b9d1...',
    date: '05 Apr 2024'
  },
  {
    id: 'ALLOC-2024-013',
    scheme: 'NHM',
    amount: 5000,
    released: 3500,
    balance: 1500,
    status: 'paused',
    hash: '0xac3f1123b4d7...',
    date: '10 Apr 2024'
  }
];

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function MinViewBudget() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Budget Summary">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          <div>
            <div className="helper">Total Allocated</div>
            <div style={{ fontWeight: 600 }}>Rs 18,200 Cr</div>
          </div>
          <div>
            <div className="helper">Released to States</div>
            <div style={{ fontWeight: 600 }}>Rs 13,300 Cr</div>
          </div>
          <div>
            <div className="helper">Pending Release</div>
            <div style={{ fontWeight: 600 }}>Rs 4,900 Cr</div>
          </div>
          <div>
            <div className="helper">Active Schemes</div>
            <div style={{ fontWeight: 600 }}>5</div>
          </div>
        </div>
      </Card>

      <Card title="Allocations from Finance Ministry">
        <table className="table">
          <thead>
            <tr>
              <th>Allocation ID</th>
              <th>Scheme</th>
              <th>Amount (Cr)</th>
              <th>Released</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Block Hash</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.scheme}</td>
                <td>Rs {item.amount}</td>
                <td>Rs {item.released}</td>
                <td>Rs {item.balance}</td>
                <td>
                  <Badge tone={statusTone(item.status)} label={item.status.toUpperCase()} />
                </td>
                <td>{item.hash}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
