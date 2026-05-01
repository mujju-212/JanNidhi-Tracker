import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');
const progress = (value, total) => {
  if (!total) return 0;
  return Math.round((Number(value || 0) / Number(total || 0)) * 100);
};
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function MinSchemeDetail() {
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet(`/api/ministry/scheme/${schemeId}`), apiGet('/api/ministry/transactions')])
      .then(([schemeResponse, txResponse]) => {
        if (!mounted) return;
        setScheme(schemeResponse?.data || null);
        setTransactions(txResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load scheme details.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [schemeId]);

  const stateRows = useMemo(() => {
    if (!scheme) return [];
    const rows = new Map();

    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed' || tx.schemeId !== scheme.schemeId || tx.fromRole !== 'ministry_admin') return;
      const key = tx.stateCode || tx.toCode || 'NA';
      const prev = rows.get(key) || { state: key, released: 0 };
      prev.released += Number(tx.amountCrore || 0);
      rows.set(key, prev);
    });

    return [...rows.values()]
      .map((row) => ({
        ...row,
        utilized: row.released,
        status: 'on-track'
      }))
      .sort((a, b) => b.released - a.released);
  }, [scheme, transactions]);

  if (loading) {
    return <div className="helper">Loading scheme details...</div>;
  }

  if (error || !scheme) {
    return <div className="helper">{error || 'Scheme not found.'}</div>;
  }

  const releaseProgress = progress(
    stateRows.reduce((sum, item) => sum + Number(item.released || 0), 0),
    Number(scheme.totalBudgetCrore || 0)
  );
  const utilizationProgress = progress(
    stateRows.reduce((sum, item) => sum + Number(item.utilized || 0), 0),
    stateRows.reduce((sum, item) => sum + Number(item.released || 0), 0)
  );

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Scheme Overview"
        action={
          <Link className="btn secondary" to="/ministry/schemes">
            Back to Schemes
          </Link>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div>
            <div className="helper">Scheme</div>
            <div style={{ fontWeight: 600 }}>{scheme.schemeName}</div>
          </div>
          <div>
            <div className="helper">Scheme ID</div>
            <div>{scheme.schemeId}</div>
          </div>
          <div>
            <div className="helper">Type</div>
            <div>{scheme.schemeType}</div>
          </div>
          <div>
            <div className="helper">Status</div>
            <Badge tone={statusTone(scheme.status)} label={scheme.status.toUpperCase()} />
          </div>
        </div>
      </Card>

      <div className="grid two">
        <Card title="Budget Snapshot">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Budget: {formatCrore(scheme.totalBudgetCrore)}</div>
            <div>Released: {formatCrore(stateRows.reduce((sum, item) => sum + Number(item.released || 0), 0))}</div>
            <div>Utilized: {formatCrore(stateRows.reduce((sum, item) => sum + Number(item.utilized || 0), 0))}</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Released ({releaseProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${releaseProgress}%` }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Utilized ({utilizationProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${utilizationProgress}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Eligibility Rules">
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px' }}>
            {(scheme.eligibilityRules || []).map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          {!scheme.eligibilityRules?.length ? (
            <div className="helper">No eligibility rules configured.</div>
          ) : null}
        </Card>
      </div>

      <Card title="State-wise Releases">
        <table className="table">
          <thead>
            <tr>
              <th>State</th>
              <th>Released (Cr)</th>
              <th>Utilized (Cr)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stateRows.map((state) => (
              <tr key={state.state}>
                <td>{state.state}</td>
                <td>{formatCrore(state.released)}</td>
                <td>{formatCrore(state.utilized)}</td>
                <td>
                  <Badge
                    tone={state.status === 'on-track' ? 'low' : 'medium'}
                    label={state.status.replace('-', ' ').toUpperCase()}
                  />
                </td>
              </tr>
            ))}
            {!stateRows.length ? (
              <tr>
                <td colSpan="4" className="helper">No state releases yet for this scheme.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
