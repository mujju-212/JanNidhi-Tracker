import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function SAMinistryDetail() {
  const { ministryId } = useParams();
  const [ministry, setMinistry] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiGet(`/api/superadmin/ministry/${ministryId}`),
      apiGet('/api/superadmin/transactions')
    ])
      .then(([ministryResponse, txResponse]) => {
        if (!mounted) return;
        setMinistry(ministryResponse?.data || null);
        setTransactions(txResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load ministry details.');
        setMinistry(null);
        setTransactions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ministryId]);

  const ministryCode = ministry?.jurisdiction?.ministryCode;

  const snapshot = useMemo(() => {
    const allocated = transactions
      .filter(
        (tx) =>
          tx.status === 'confirmed' && tx.fromRole === 'super_admin' && tx.toCode === ministryCode
      )
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);

    const released = transactions
      .filter(
        (tx) =>
          tx.status === 'confirmed' && tx.fromCode === ministryCode && tx.fromRole === 'ministry_admin'
      )
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);

    const utilized = transactions
      .filter(
        (tx) =>
          tx.status === 'confirmed' &&
          tx.ministryCode === ministryCode &&
          ['state_admin', 'district_admin'].includes(tx.fromRole)
      )
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);

    return {
      allocated,
      released,
      utilized
    };
  }, [transactions, ministryCode]);

  const releases = useMemo(
    () =>
      transactions
        .filter((tx) => tx.fromCode === ministryCode && tx.toRole === 'state_admin')
        .slice(0, 20)
        .map((tx) => ({
          id: tx.transactionId,
          state: tx.stateCode || tx.toCode || '-',
          amount: Number(tx.amountCrore || 0),
          status: tx.status
        })),
    [transactions, ministryCode]
  );

  const schemes = useMemo(() => {
    const grouped = new Map();
    transactions.forEach((tx) => {
      if (tx.fromCode !== ministryCode) return;
      if (!tx.schemeId || tx.schemeId === 'BUDGET_ALLOCATION') return;
      const key = tx.schemeId;
      const item = grouped.get(key) || {
        id: tx.schemeId,
        name: tx.schemeName || tx.schemeId,
        type: 'scheme',
        budget: 0
      };
      item.budget += Number(tx.amountCrore || 0);
      grouped.set(key, item);
    });
    return [...grouped.values()].slice(0, 20);
  }, [transactions, ministryCode]);

  const releaseProgress = ministry?.budgetCapCrore
    ? Math.min(100, Math.round((snapshot.released / ministry.budgetCapCrore) * 100))
    : 0;
  const utilizationProgress = snapshot.released
    ? Math.min(100, Math.round((snapshot.utilized / snapshot.released) * 100))
    : 0;

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Ministry Profile"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link className="btn secondary" to="/superadmin/transactions">
              View Transactions
            </Link>
            <Link className="btn" to="/superadmin/reports">
              Generate Report
            </Link>
          </div>
        }
      >
        {loading ? <div className="helper">Loading ministry profile...</div> : null}
        {error ? <div className="alert">{error}</div> : null}
        {!loading && !error && !ministry ? <div className="helper">Ministry not found.</div> : null}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}
        >
          <div>
            <div className="helper">Ministry</div>
            <div style={{ fontWeight: 600 }}>{ministry?.jurisdiction?.ministry || '-'}</div>
          </div>
          <div>
            <div className="helper">Code</div>
            <div>{ministry?.jurisdiction?.ministryCode || '-'}</div>
          </div>
          <div>
            <div className="helper">Head of Department</div>
            <div>{ministry?.fullName || '-'}</div>
          </div>
          <div>
            <div className="helper">Wallet</div>
            <div className="wallet-cell">{ministry?.walletAddress || '-'}</div>
          </div>
          <div>
            <div className="helper">Contact</div>
            <div>{ministry?.email || '-'}</div>
            <div>{ministry?.phone || '-'}</div>
          </div>
          <div>
            <div className="helper">Status</div>
            <Badge
              tone={statusTone(ministry?.isActive ? 'active' : 'inactive')}
              label={(ministry?.isActive ? 'ACTIVE' : 'INACTIVE')}
            />
          </div>
        </div>
      </Card>

      <div className="grid two">
        <Card title="Budget Snapshot">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Budget Cap: Rs {Number(ministry?.budgetCapCrore || 0).toFixed(2)} Cr</div>
            <div>Allocated: Rs {snapshot.allocated.toFixed(2)} Cr</div>
            <div>Released: Rs {snapshot.released.toFixed(2)} Cr</div>
            <div>Utilized: Rs {snapshot.utilized.toFixed(2)} Cr</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Released vs Cap ({releaseProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${releaseProgress}%` }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Utilization ({utilizationProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${utilizationProgress}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Release Schedule">
          <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Release ID</th>
                <th>State</th>
                <th>Amount (Cr)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => (
                <tr key={release.id}>
                  <td>{release.id}</td>
                  <td>{release.state}</td>
                  <td>Rs {release.amount}</td>
                  <td>
                    <Badge tone={release.status === 'confirmed' ? 'low' : 'medium'} label={release.status.toUpperCase()} />
                  </td>
                </tr>
              ))}
              {!releases.length ? (
                <tr>
                  <td colSpan="4" className="helper">No release records found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
          </div>
        </Card>
      </div>

      <Card title="Active Schemes">
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Scheme ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Budget (Cr)</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((scheme) => (
              <tr key={scheme.id}>
                <td>{scheme.id}</td>
                <td>{scheme.name}</td>
                <td>{scheme.type}</td>
                <td>Rs {scheme.budget}</td>
                <td>
                  <span className="helper">Derived from transaction totals</span>
                </td>
                <td>
                  <Badge tone={statusTone('active')} label="ACTIVE" />
                </td>
              </tr>
            ))}
            {!schemes.length ? (
              <tr>
                <td colSpan="6" className="helper">No active scheme transaction data yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
