import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function MinSchemeList() {
  const [schemes, setSchemes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/ministry/scheme/all'), apiGet('/api/ministry/transactions')])
      .then(([schemeResponse, txResponse]) => {
        if (!mounted) return;
        setSchemes(schemeResponse?.data || []);
        setTransactions(txResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load schemes.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    const releasedMap = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed' || tx.fromRole !== 'ministry_admin') return;
      releasedMap.set(tx.schemeId, (releasedMap.get(tx.schemeId) || 0) + Number(tx.amountCrore || 0));
    });

    return schemes.map((scheme) => {
      const budget = Number(scheme.totalBudgetCrore || 0);
      const released = Number(releasedMap.get(scheme.schemeId) || 0);
      const progress = budget > 0 ? Math.min(100, Math.round((released / budget) * 100)) : 0;
      return {
        id: scheme.schemeId,
        name: scheme.schemeName,
        type: scheme.schemeType,
        budget,
        progress
      };
    });
  }, [schemes, transactions]);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Active Schemes">
        <div className="grid stats">
          {loading ? <div className="helper">Loading schemes...</div> : null}
          {error ? <div className="helper">{error}</div> : null}
          {cards.map((scheme) => (
            <div key={scheme.name} className="card" style={{ padding: '16px' }}>
              <strong>{scheme.name}</strong>
              <div className="helper">Type: {scheme.type}</div>
              <div className="helper">Budget: {formatCrore(scheme.budget)}</div>
              <div className="progress" style={{ marginTop: '10px' }}>
                <span style={{ width: `${scheme.progress}%` }} />
              </div>
              <Link className="btn secondary" style={{ marginTop: '12px' }} to={`/ministry/scheme/${scheme.id}`}>
                View Details
              </Link>
            </div>
          ))}
          {!loading && !error && !cards.length ? <div className="helper">No schemes available.</div> : null}
        </div>
      </Card>
    </div>
  );
}
