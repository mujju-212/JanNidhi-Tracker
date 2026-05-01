import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function MinFlagCenter() {
  const [filter, setFilter] = useState('all');
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/ministry/flags')
      .then((response) => {
        if (!mounted) return;
        setFlags(response?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load flags.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = flags.filter((item) => filter === 'all' || item.flagType === filter);

  return (
    <Card title="Flag Center" action={<button className="btn">Generate Report</button>}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {['all', 'critical', 'high', 'medium', 'low'].map((item) => (
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
          {loading ? (
            <tr>
              <td colSpan="8" className="helper">Loading flags...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="8" className="helper">{error}</td>
            </tr>
          ) : null}
          {filtered.map((flag) => (
            <tr key={flag._id}>
              <td>{flag.flagId || flag._id}</td>
              <td>
                <Badge tone={flag.flagType} label={String(flag.flagType || '-').toUpperCase()} />
              </td>
              <td>{flag.schemeName || flag.schemeId || '-'}</td>
              <td>{flag.stateCode || '-'}</td>
              <td>{flag.flagReason || '-'}</td>
              <td>{String(flag.status || '-').replace('_', ' ')}</td>
              <td>{flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : '-'}</td>
              <td>
                <button className="btn secondary" type="button">
                  Review
                </button>
              </td>
            </tr>
          ))}
          {!loading && !error && !filtered.length ? (
            <tr>
              <td colSpan="8" className="helper">No flags found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
