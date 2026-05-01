import Card from '../../components/common/Card.jsx';

const schemes = [
  {
    name: 'PM-KISAN',
    status: 'Paid',
    amount: 'Rs 2000',
    date: '12 Jan 2024',
    block: '0x3f9a2...'
  },
  {
    name: 'PM Awas Yojana',
    status: 'Pending',
    amount: 'Rs 150000',
    date: 'Expected 20 Jan 2024',
    block: 'Pending'
  }
];

export default function CitizenDashboard() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="My Schemes">
        <div style={{ display: 'grid', gap: '12px' }}>
          {schemes.map((scheme) => (
            <div key={scheme.name} className="stat-card">
              <div className="stat-meta">
                <strong>{scheme.name}</strong>
                <span>Status: {scheme.status}</span>
                <span>Amount: {scheme.amount}</span>
                <span>Block: {scheme.block}</span>
              </div>
              <span className="helper">{scheme.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
