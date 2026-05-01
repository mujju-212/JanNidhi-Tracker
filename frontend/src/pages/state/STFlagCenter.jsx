import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function STFlagCenter() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/state/flags')
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

  return (
    <Card title="State Flag Center">
      <table className="table">
        <thead>
          <tr>
            <th>Flag ID</th>
            <th>Type</th>
            <th>Issue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="helper">Loading flags...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="4" className="helper">{error}</td>
            </tr>
          ) : null}
          {flags.map((flag) => (
            <tr key={flag._id}>
              <td>{flag.flagId || flag._id}</td>
              <td>
                <Badge tone={flag.flagType} label={String(flag.flagType || '-').toUpperCase()} />
              </td>
              <td>{flag.flagReason || '-'}</td>
              <td>{flag.status || '-'}</td>
            </tr>
          ))}
          {!loading && !error && !flags.length ? (
            <tr>
              <td colSpan="4" className="helper">No flags found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
