import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const flags = [
  {
    id: 'FLAG-2024-021',
    type: 'high',
    scheme: 'Ayushman Bharat',
    state: 'Bihar',
    issue: 'Duplicate beneficiary batch',
    status: 'awaiting_response',
    date: '19 May 2024'
  },
  {
    id: 'FLAG-2024-020',
    type: 'medium',
    scheme: 'PM POSHAN',
    state: 'Rajasthan',
    issue: 'Delayed UC submission',
    status: 'under_review',
    date: '18 May 2024'
  },
  {
    id: 'FLAG-2024-019',
    type: 'low',
    scheme: 'NHM',
    state: 'Assam',
    issue: 'Utilization below 50%',
    status: 'resolved',
    date: '17 May 2024'
  }
];

export default function MinFlagCenter() {
  const [filter, setFilter] = useState('all');
  const filtered = flags.filter((item) => filter === 'all' || item.type === filter);

  return (
    <Card title="Flag Center" action={<button className="btn">Generate Report</button>}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {['all', 'high', 'medium', 'low'].map((item) => (
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
            <th>Scheme</th>
            <th>State</th>
            <th>Issue</th>
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
              <td>{flag.scheme}</td>
              <td>{flag.state}</td>
              <td>{flag.issue}</td>
              <td>{flag.status.replace('_', ' ')}</td>
              <td>{flag.date}</td>
              <td>
                <button className="btn secondary" type="button">
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
