import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

const transactions = [
  {
    id: 'TXN-001',
    from: 'Finance Ministry',
    to: 'MoHFW',
    amount: '22186',
    scheme: 'Ayushman Bharat',
    status: 'confirmed',
    hash: '0xa3f9c2e8b4d7...',
    date: '01 Apr 2024'
  },
  {
    id: 'TXN-002',
    from: 'Finance Ministry',
    to: 'MoEdu',
    amount: '14500',
    scheme: 'PM POSHAN',
    status: 'confirmed',
    hash: '0xa7f4c2e8b9d1...',
    date: '01 Apr 2024'
  },
  {
    id: 'TXN-003',
    from: 'Finance Ministry',
    to: 'MoAgri',
    amount: '1250',
    scheme: 'PM-KISAN',
    status: 'flagged',
    hash: '0xac3f1123b4d7...',
    date: '03 Apr 2024'
  }
];

export default function SABudgetHistory() {
  const [selected, setSelected] = useState(transactions[0]);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Transaction History">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '12px'
          }}
        >
          <div className="form-group">
            <label>Ministry</label>
            <select>
              <option>All</option>
              <option>MoHFW</option>
              <option>MoEdu</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select>
              <option>All</option>
              <option>confirmed</option>
              <option>flagged</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <input placeholder="Apr 2024 - Now" />
          </div>
          <div className="form-group">
            <label>Amount Range</label>
            <input placeholder="0 - 99999" />
          </div>
        </div>

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
              <th>Action</th>
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
                <td>{tx.status}</td>
                <td>{tx.date}</td>
                <td>
                  <button className="btn secondary" onClick={() => setSelected(tx)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Block Details">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Transaction ID: {selected.id}</div>
          <div>Block Hash: {selected.hash}</div>
          <div>From Wallet: 0x1a2b3c...</div>
          <div>To Wallet: 0x4a9f2c...</div>
          <div>Amount: Rs {selected.amount} Cr</div>
          <div>Timestamp: {selected.date} 09:00 AM</div>
        </div>
      </Card>
    </div>
  );
}
