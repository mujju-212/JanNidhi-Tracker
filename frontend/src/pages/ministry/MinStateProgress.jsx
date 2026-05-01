import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function MinStateProgress() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/ministry/reports')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data?.releasesByState || [];
        setRows(
          items.map((item) => ({
            state: item._id || '-',
            released: Number(item.total || 0),
            utilized: Number(item.total || 0),
            pendingUc: 'Pending UC data not available',
            status: 'on-track'
          }))
        );
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load state progress.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card title="State-wise Progress">
      <table className="table">
        <thead>
          <tr>
            <th>State</th>
            <th>Released (Cr)</th>
            <th>Utilized (Cr)</th>
            <th>Utilization</th>
            <th>Pending UCs</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="helper">Loading progress...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="6" className="helper">{error}</td>
            </tr>
          ) : null}
          {rows.map((item) => (
            <tr key={item.state}>
              <td>{item.state}</td>
              <td>{formatCrore(item.released)}</td>
              <td>{formatCrore(item.utilized)}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.round((item.utilized / item.released) * 100)}%` }}
                  />
                </div>
              </td>
              <td>{item.pendingUc}</td>
              <td>
                <Badge tone={item.status === 'on-track' ? 'low' : 'medium'} label={item.status.replace('-', ' ').toUpperCase()} />
              </td>
            </tr>
          ))}
          {!loading && !error && !rows.length ? (
            <tr>
              <td colSpan="6" className="helper">No state progress data available.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
