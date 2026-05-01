import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { Banknote, Users, ShieldCheck, Map } from 'lucide-react';

const stats = [
  { title: 'Funds Allocated', value: 'Rs 48210 Cr', sub: 'FY 2024-25', icon: Banknote, accent: '#0f4aa7' },
  { title: 'Beneficiaries Paid', value: '24.1M', sub: 'Verified', icon: Users, accent: '#16b6a4' },
  { title: 'Active Schemes', value: '750+', sub: 'Across India', icon: ShieldCheck, accent: '#1aa26f' },
  { title: 'States Covered', value: '28', sub: 'Nationwide', icon: Map, accent: '#334155' }
];

const recent = [
  { ministry: 'MoHFW', scheme: 'Ayushman Bharat', amount: 'Rs 425 Cr', time: '2 mins ago' },
  { ministry: 'MoEdu', scheme: 'PM POSHAN', amount: 'Rs 380 Cr', time: '5 mins ago' }
];

export default function PublicHome() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Track Every Public Rupee — In Real Time">
        <p className="helper">
          Powered by blockchain. Every transfer is recorded, verified, and
          traceable from ministry to beneficiary.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <a className="btn" href="/public/citizen-login">Track My Benefit</a>
          <a className="btn secondary" href="/public/explore">Explore Fund Flows</a>
        </div>
      </Card>

      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Card title="Recent Verified Transactions">
        <table className="table">
          <thead>
            <tr>
              <th>Ministry</th>
              <th>Scheme</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((item, index) => (
              <tr key={`${item.scheme}-${index}`}>
                <td>{item.ministry}</td>
                <td>{item.scheme}</td>
                <td>{item.amount}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
