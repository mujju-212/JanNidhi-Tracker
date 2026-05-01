import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const flags = [
  {
    id: 'FLAG-2024-047',
    type: 'critical',
    transaction: 'TXN-2024-MH-011',
    ministry: 'MoHFW',
    state: 'Bihar',
    raisedBy: 'auto',
    status: 'awaiting_response',
    date: '20 May 2024'
  },
  {
    id: 'FLAG-2024-046',
    type: 'high',
    transaction: 'TXN-2024-UP-008',
    ministry: 'MoEdu',
    state: 'UP',
    raisedBy: 'auditor',
    status: 'under_review',
    date: '20 May 2024'
  },
  {
    id: 'FLAG-2024-045',
    type: 'medium',
    transaction: 'TXN-2024-MP-004',
    ministry: 'MoAgri',
    state: 'MP',
    raisedBy: 'citizen',
    status: 'resolved',
    date: '19 May 2024'
  }
];

export default function SAFlagCenter() {
  const [filter, setFilter] = useState('all');

  const filtered = flags.filter((item) => filter === 'all' || item.type === filter);

  return (
    <Card title="Flag Center" action={<button className="btn">Generate Report</button>}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {['all', 'critical', 'high', 'medium'].map((item) => (
          <button
            key={item}
            className={item === filter ? 'btn' : 'btn secondary'}
            onClick={() => setFilter(item)}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Flag ID</th>
            <th>Type</th>
            <th>Transaction</th>
            <th>Ministry</th>
            <th>State</th>
            <th>Raised By</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.id}</td>
              <td>
                <Badge tone={flag.type} label={flag.type.toUpperCase()} />
              </td>
              <td>{flag.transaction}</td>
              <td>{flag.ministry}</td>
              <td>{flag.state}</td>
              <td>{flag.raisedBy}</td>
              <td>{flag.status.replace('_', ' ')}</td>
              <td>{flag.date}</td>
              <td>
                <button className="btn secondary">Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
