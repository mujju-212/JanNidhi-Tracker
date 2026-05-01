import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function STDistrictList() {
  const [districts, setDistricts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/state/district/all'), apiGet('/api/state/transactions')])
      .then(([districtResponse, txResponse]) => {
        if (!mounted) return;
        setDistricts(districtResponse?.data || []);
        setTransactions(txResponse?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load district accounts.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    const releasedMap = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed' || tx.fromRole !== 'state_admin') return;
      const key = tx.districtCode || tx.toCode;
      releasedMap.set(key, (releasedMap.get(key) || 0) + Number(tx.amountCrore || 0));
    });

    const highest = Math.max(
      1,
      ...districts.map((district) => Number(releasedMap.get(district.jurisdiction?.districtCode) || 0))
    );

    return districts.map((district) => {
      const released = Number(releasedMap.get(district.jurisdiction?.districtCode) || 0);
      return {
        id: district._id,
        name: district.jurisdiction?.district || '-',
        collector: district.fullName || '-',
        wallet: district.walletAddress || '-',
        released,
        utilization: Math.round((released / highest) * 100),
        status: district.isActive ? 'active' : 'watch'
      };
    });
  }, [districts, transactions]);

  return (
    <Card
      title="District Accounts"
      action={
        <Link className="btn" to="/state/create-district">
          Create District
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>District</th>
            <th>Collector</th>
            <th>Wallet</th>
            <th>Released (Cr)</th>
            <th>Utilization</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="helper">Loading districts...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="7" className="helper">{error}</td>
            </tr>
          ) : null}
          {rows.map((district) => (
            <tr key={district.name}>
              <td>{district.name}</td>
              <td>{district.collector}</td>
              <td>{district.wallet}</td>
              <td>{formatCrore(district.released)}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${district.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={district.status === 'active' ? 'low' : 'medium'} label={district.status.toUpperCase()} />
              </td>
              <td>
                <Link className="btn secondary" to="/state/district-progress">
                  View Progress
                </Link>
              </td>
            </tr>
          ))}
          {!loading && !error && !rows.length ? (
            <tr>
              <td colSpan="7" className="helper">No district accounts found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
