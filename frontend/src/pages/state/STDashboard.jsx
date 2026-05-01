import { Banknote, Send, Wallet, Map, ShieldAlert } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';

const stats = [
  { title: 'Received from Ministries', value: 'Rs 1225 Cr', sub: 'FY 2024-25', icon: Banknote, accent: '#0f4aa7' },
  { title: 'Released to Districts', value: 'Rs 980 Cr', sub: '18 districts', icon: Send, accent: '#16b6a4' },
  { title: 'Remaining Balance', value: 'Rs 245 Cr', sub: 'Available', icon: Wallet, accent: '#1aa26f' },
  { title: 'Active Districts', value: '18', sub: 'All reporting', icon: Map, accent: '#334155' },
  { title: 'Active Flags', value: '4', sub: 'Open cases', icon: ShieldAlert, accent: '#e8515b' }
];

const recent = [
  { id: 'TXN-2024-MH-011', scheme: 'PM POSHAN', amount: '45', status: 'confirmed' },
  { id: 'TXN-2024-MH-012', scheme: 'Ayushman Bharat', amount: '40', status: 'confirmed' },
  { id: 'TXN-2024-MH-013', scheme: 'NHM', amount: '22', status: 'pending' }
];

export default function STDashboard() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <div className="grid stats">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Card title="Recent Transactions">
        <table className="table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>Scheme</th>
              <th>Amount (Cr)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.scheme}</td>
                <td>Rs {tx.amount}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="District-wise Fund Map">
        <div className="helper">Map view will appear here (placeholder).</div>
      </Card>
    </div>
  );
}
