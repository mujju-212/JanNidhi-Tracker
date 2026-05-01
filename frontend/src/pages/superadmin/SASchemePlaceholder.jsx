import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => {
  if (status === 'active') return 'low';
  if (status === 'completed') return 'low';
  if (status === 'draft') return 'medium';
  return 'high';
};

const typeLabel = (type) => {
  if (type === 'central_sector') return 'Central Sector';
  if (type === 'centrally_sponsored') return 'Centrally Sponsored';
  if (type === 'state_scheme') return 'State Scheme';
  return type || '-';
};

export default function SASchemePlaceholder() {
  const [schemes, setSchemes] = useState([]);
  const [flags, setFlags] = useState([]);
  const [filters, setFilters] = useState({
    ministry: 'all',
    status: 'all',
    type: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/superadmin/schemes'), apiGet('/api/superadmin/flags')])
      .then(([schemesResponse, flagsResponse]) => {
        if (!mounted) return;
        setSchemes(schemesResponse?.data || []);
        setFlags(flagsResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load scheme portfolio.');
        setSchemes([]);
        setFlags([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const ministryOptions = useMemo(
    () =>
      [...new Set(schemes.map((item) => item.ownerMinistryCode).filter(Boolean))].sort(),
    [schemes]
  );

  const filteredSchemes = useMemo(
    () =>
      schemes.filter((scheme) => {
        if (filters.ministry !== 'all' && scheme.ownerMinistryCode !== filters.ministry) return false;
        if (filters.status !== 'all' && scheme.status !== filters.status) return false;
        if (filters.type !== 'all' && scheme.schemeType !== filters.type) return false;
        return true;
      }),
    [schemes, filters]
  );

  const approvalQueue = useMemo(
    () =>
      schemes
        .filter((scheme) => scheme.status === 'draft' || scheme.status === 'paused')
        .slice(0, 10),
    [schemes]
  );

  const schemeAlerts = useMemo(
    () =>
      flags
        .filter((flag) => flag.schemeId && ['critical', 'high', 'medium'].includes(flag.flagType))
        .slice(0, 6),
    [flags]
  );

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Scheme Portfolio" action={<span className="helper">Live backend data</span>}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '12px'
          }}
        >
          <div className="form-group">
            <label>Ministry</label>
            <select
              value={filters.ministry}
              onChange={(event) => setFilters((prev) => ({ ...prev, ministry: event.target.value }))}
            >
              <option value="all">All</option>
              {ministryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="all">All</option>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="completed">completed</option>
              <option value="draft">draft</option>
            </select>
          </div>
          <div className="form-group">
            <label>Scheme Type</label>
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="all">All</option>
              <option value="central_sector">Central Sector</option>
              <option value="centrally_sponsored">Centrally Sponsored</option>
              <option value="state_scheme">State Scheme</option>
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Scheme ID</th>
              <th>Name</th>
              <th>Ministry</th>
              <th>Type</th>
              <th>Budget (Cr)</th>
              <th>Released (Cr)</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="helper">Loading schemes...</td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan="8" className="helper">{error}</td>
              </tr>
            ) : null}
            {filteredSchemes.map((scheme) => (
              <tr key={scheme.schemeId}>
                <td>{scheme.schemeId}</td>
                <td>{scheme.schemeName}</td>
                <td>{scheme.ownerMinistryCode}</td>
                <td>{typeLabel(scheme.schemeType)}</td>
                <td>Rs {Number(scheme.totalBudgetCrore || 0).toFixed(2)}</td>
                <td>Rs {Number(scheme.releasedCrore || 0).toFixed(2)}</td>
                <td>
                  <div className="helper">{Number(scheme.utilizationPercent || 0).toFixed(1)}%</div>
                  <div className="progress">
                    <span style={{ width: `${Math.min(100, Number(scheme.utilizationPercent || 0))}%` }} />
                  </div>
                </td>
                <td>
                  <Badge tone={statusTone(scheme.status)} label={String(scheme.status || '-').toUpperCase()} />
                </td>
              </tr>
            ))}
            {!loading && !error && !filteredSchemes.length ? (
              <tr>
                <td colSpan="8" className="helper">No schemes found for selected filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <div className="grid two">
        <Card title="Approval Queue" action={<span className="helper">{approvalQueue.length} pending</span>}>
          <table className="table">
            <thead>
              <tr>
                <th>Scheme ID</th>
                <th>Scheme</th>
                <th>Ministry</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {approvalQueue.map((item) => (
                <tr key={item.schemeId}>
                  <td>{item.schemeId}</td>
                  <td>{item.schemeName}</td>
                  <td>{item.ownerMinistryCode}</td>
                  <td>{item.status}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {!approvalQueue.length ? (
                <tr>
                  <td colSpan="5" className="helper">No scheme approval queue at the moment.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card title="Scheme Alerts">
          <div style={{ display: 'grid', gap: '10px' }}>
            {schemeAlerts.map((alert) => (
              <div key={alert.flagId} className="card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{alert.schemeId}</div>
                    <div className="helper">{alert.flagReason || '-'}</div>
                  </div>
                  <Badge tone={alert.flagType} label={String(alert.flagType || '-').toUpperCase()} />
                </div>
              </div>
            ))}
            {!schemeAlerts.length ? <div className="helper">No scheme-specific alerts found.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
