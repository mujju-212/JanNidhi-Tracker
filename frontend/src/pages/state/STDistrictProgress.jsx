import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function STDistrictProgress() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/state/district/all'), apiGet('/api/state/transactions')])
      .then(([districtResponse, txResponse]) => {
        if (!mounted) return;
        const districts = districtResponse?.data || [];
        const transactions = txResponse?.data || [];
        const releasedMap = new Map();
        transactions.forEach((tx) => {
          if (tx.status !== 'confirmed' || tx.fromRole !== 'state_admin') return;
          const key = tx.districtCode || tx.toCode;
          releasedMap.set(key, (releasedMap.get(key) || 0) + Number(tx.amountCrore || 0));
        });

        setRows(
          districts.map((district) => {
            const released = Number(releasedMap.get(district.jurisdiction?.districtCode) || 0);
            return {
              district: district.jurisdiction?.district || '-',
              released,
              utilized: released,
              pendingUc: 'Pending UC data not available',
              status: released > 0 ? 'on-track' : 'watch'
            };
          })
        );
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load district progress.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card title="District Progress">
      <table className="table">
        <thead>
          <tr>
            <th>District</th>
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
              <td colSpan="6" className="helper">Loading district progress...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="6" className="helper">{error}</td>
            </tr>
          ) : null}
          {rows.map((item) => (
            <tr key={item.district}>
              <td>{item.district}</td>
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
              <td colSpan="6" className="helper">No district progress data available.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
