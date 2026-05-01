import { Banknote, CreditCard, Wallet, Users, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';

const stats = [
  { title: 'Received from State', value: 'Rs 45 Cr', sub: 'PM POSHAN', icon: Banknote, accent: '#0f4aa7' },
  { title: 'Paid to Beneficiaries', value: 'Rs 32 Cr', sub: 'This month', icon: CreditCard, accent: '#16b6a4' },
  { title: 'Remaining Balance', value: 'Rs 13 Cr', sub: 'Available', icon: Wallet, accent: '#1aa26f' },
  { title: 'Total Beneficiaries', value: '245890', sub: 'Active', icon: Users, accent: '#334155' },
  { title: 'Active Flags', value: '2', sub: 'Needs response', icon: AlertTriangle, accent: '#e8515b' }
];

const payments = [
  { id: 'PAY-2024-2201', scheme: 'PM POSHAN', status: 'success', amount: '0.45' },
  { id: 'PAY-2024-2202', scheme: 'PM POSHAN', status: 'held', amount: '0.02' }
];

export default function DTDashboard() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Card title="Recent Payments">
        <table className="table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Scheme</th>
              <th>Status</th>
              <th>Amount (Cr)</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => (
              <tr key={pay.id}>
                <td>{pay.id}</td>
                <td>{pay.scheme}</td>
                <td>{pay.status}</td>
                <td>Rs {pay.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Open Complaints">
        <div className="helper">3 complaints pending response.</div>
      </Card>
    </div>
  );
}
