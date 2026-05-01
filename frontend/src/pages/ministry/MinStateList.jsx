import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function MinStateList() {
  const [states, setStates] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/ministry/state/all'), apiGet('/api/ministry/transactions')])
      .then(([stateResponse, txResponse]) => {
        if (!mounted) return;
        setStates(stateResponse?.data || []);
        setTransactions(txResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load states.');
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
      if (tx.status !== 'confirmed' || tx.fromRole !== 'ministry_admin') return;
      const key = tx.stateCode || tx.toCode;
      releasedMap.set(key, (releasedMap.get(key) || 0) + Number(tx.amountCrore || 0));
    });

    const highest = Math.max(
      1,
      ...states.map((state) => Number(releasedMap.get(state.jurisdiction?.stateCode) || 0))
    );

    return states.map((state) => {
      const released = Number(releasedMap.get(state.jurisdiction?.stateCode) || 0);
      return {
        key: state._id,
        name: state.jurisdiction?.state || '-',
        officer: state.fullName || '-',
        wallet: state.walletAddress || '-',
        released,
        utilization: Math.round((released / highest) * 100),
        status: state.isActive ? 'active' : 'watch'
      };
    });
  }, [states, transactions]);

  return (
    <Card
      title="State Accounts"
      action={
        <Link className="btn" to="/ministry/create-state">
          Create State
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>State</th>
            <th>Officer</th>
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
              <td colSpan="7" className="helper">Loading states...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="7" className="helper">{error}</td>
            </tr>
          ) : null}
          {rows.map((state) => (
            <tr key={state.name}>
              <td>{state.name}</td>
              <td>{state.officer}</td>
              <td>{state.wallet}</td>
              <td>{formatCrore(state.released)}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${state.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={state.status === 'active' ? 'low' : 'medium'} label={state.status.toUpperCase()} />
              </td>
              <td>
                <Link className="btn secondary" to="/ministry/state-progress">
                  View Progress
                </Link>
              </td>
            </tr>
          ))}
          {!loading && !error && !rows.length ? (
            <tr>
              <td colSpan="7" className="helper">No state accounts found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
