import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function STStateSchemeList() {
  const [funds, setFunds] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/state/funds'), apiGet('/api/state/transactions')])
      .then(([fundResponse, txResponse]) => {
        if (!mounted) return;
        setFunds(fundResponse?.data || []);
        setOutgoing((txResponse?.data || []).filter((item) => item.fromRole === 'state_admin'));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load scheme list.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const schemes = useMemo(() => {
    const incoming = new Map();
    funds.forEach((item) => {
      const key = item.schemeId || item.schemeName || 'UNKNOWN';
      const prev = incoming.get(key) || { id: key, name: item.schemeName || key, budget: 0, released: 0 };
      prev.budget += Number(item.amountCrore || 0);
      incoming.set(key, prev);
    });
    outgoing.forEach((item) => {
      const key = item.schemeId || item.schemeName || 'UNKNOWN';
      const prev = incoming.get(key) || { id: key, name: item.schemeName || key, budget: 0, released: 0 };
      prev.released += Number(item.amountCrore || 0);
      incoming.set(key, prev);
    });
    return [...incoming.values()].map((item) => ({
      ...item,
      progress: item.budget > 0 ? Math.min(100, Math.round((item.released / item.budget) * 100)) : 0,
      status: item.released > 0 ? 'active' : 'under_review'
    }));
  }, [funds, outgoing]);

  return (
    <Card
      title="State Schemes"
      action={
        <Link className="btn" to="/state/create-state-scheme">
          Create Scheme
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Scheme ID</th>
            <th>Name</th>
            <th>Budget (Cr)</th>
            <th>Utilization</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="helper">Loading state schemes...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="5" className="helper">{error}</td>
            </tr>
          ) : null}
          {schemes.map((scheme) => (
            <tr key={scheme.id}>
              <td>{scheme.id}</td>
              <td>{scheme.name}</td>
              <td>{formatCrore(scheme.budget)}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${scheme.progress}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={scheme.status === 'active' ? 'low' : 'medium'} label={scheme.status.toUpperCase()} />
              </td>
            </tr>
          ))}
          {!loading && !error && !schemes.length ? (
            <tr>
              <td colSpan="5" className="helper">No scheme-wise fund data available.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
