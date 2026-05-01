import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function SAFlagCenter() {
  const [filter, setFilter] = useState('all');
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/superadmin/flags')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        const mapped = items.map((flag) => ({
          id: flag.flagId,
          type: flag.flagType,
          transaction: flag.transactionId,
          ministry: flag.ministryCode || '-',
          state: flag.stateCode || '-',
          raisedBy: flag.raisedByType || '-',
          status: flag.status || '-',
          date: flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : '-'
        }));
        setFlags(mapped);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load flags.');
        setFlags([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
          {loading ? (
            <tr>
              <td colSpan="9" className="helper">
                Loading flags...
              </td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="9" className="helper">
                {error}
              </td>
            </tr>
          ) : null}
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
