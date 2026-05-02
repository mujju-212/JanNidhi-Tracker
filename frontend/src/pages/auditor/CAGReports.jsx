import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

const ETHERSCAN = 'https://sepolia.etherscan.io';

export default function CAGReports() {
  const [leakage, setLeakage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [context, setContext] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [timelineSchemeId, setTimelineSchemeId] = useState('');
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTimeline = async (schemeId = '') => {
    setTimelineLoading(true);
    try {
      const query = schemeId ? `?schemeId=${encodeURIComponent(schemeId)}` : '';
      const response = await apiGet(`/api/auditor/timeline${query}`);
      setTimeline(response?.data || null);
    } catch (err) {
      console.error('Timeline load error:', err);
      setTimeline(null);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [leakRes, txRes, flagRes, contextRes] = await Promise.all([
          apiGet('/api/auditor/leakage'),
          apiGet('/api/auditor/transactions'),
          apiGet('/api/auditor/flags'),
          apiGet('/api/auditor/access-context')
        ]);
        setLeakage(leakRes?.data || {});
        setTransactions(txRes?.data || []);
        setFlags(flagRes?.data || []);
        setContext(contextRes?.data || {});
      } catch (err) {
        console.error('Reports load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    loadTimeline();
  }, []);

  if (loading) return <div className="loading">Loading reports...</div>;

  const flagsByType = {};
  flags.forEach((f) => { flagsByType[f.flagType] = (flagsByType[f.flagType] || 0) + 1; });
  const resolvedCount = flags.filter((f) => f.status === 'resolved').length;
  const openCount = flags.filter((f) => f.status !== 'resolved').length;

  const txByRole = {};
  transactions.forEach((tx) => {
    const key = `${tx.fromRole} → ${tx.toRole}`;
    txByRole[key] = (txByRole[key] || 0) + Number(tx.amountCrore || 0);
  });

  return (
    <div className="grid" style={{ gap: '16px' }}>
      <Card title="Auditor Scope">
        <div className="helper" style={{ display: 'grid', gap: '6px' }}>
          <div>Role: <strong>{context?.role || '-'}</strong></div>
          <div>
            Jurisdiction:
            <strong>
              {' '}
              {context?.jurisdiction?.stateCode || context?.jurisdiction?.state || 'All India'}
            </strong>
          </div>
          <div>
            Assigned Schemes:
            <strong> {context?.assignedSchemes?.length ? context.assignedSchemes.join(', ') : 'All schemes'}</strong>
          </div>
        </div>
      </Card>

      <Card title="Leakage Analysis Report">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-meta">
              <span>Sent to Districts</span>
              <strong style={{ fontSize: '20px' }}>{(leakage?.toDistricts || 0).toFixed(2)} Cr</strong>
            </div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-meta">
              <span>Reached Beneficiaries</span>
              <strong style={{ fontSize: '20px', color: '#16a34a' }}>{(leakage?.toBeneficiary || 0).toFixed(2)} Cr</strong>
            </div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-meta">
              <span>Unaccounted</span>
              <strong style={{ fontSize: '20px', color: '#dc2626' }}>{(leakage?.unaccounted || 0).toFixed(2)} Cr</strong>
            </div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-meta">
              <span>Leakage %</span>
              <strong style={{ fontSize: '20px', color: '#f59e0b' }}>{(leakage?.leakagePercent || 0).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid two">
        <Card title="Fund Flow Summary">
          <table className="table">
            <thead><tr><th>Flow</th><th>Amount (Cr)</th></tr></thead>
            <tbody>
              {Object.entries(txByRole).map(([key, amt]) => (
                <tr key={key}>
                  <td style={{ fontSize: '13px' }}>{key.replace('_admin', '').replace('super_admin', 'Centre')}</td>
                  <td style={{ fontWeight: 600 }}>{amt.toFixed(2)} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Flag Summary">
          <table className="table">
            <thead><tr><th>Category</th><th>Count</th></tr></thead>
            <tbody>
              {Object.entries(flagsByType).map(([type, count]) => (
                <tr key={type}>
                  <td style={{ textTransform: 'capitalize' }}>{type}</td>
                  <td style={{ fontWeight: 600 }}>{count}</td>
                </tr>
              ))}
              <tr><td>Open</td><td style={{ fontWeight: 600, color: '#dc2626' }}>{openCount}</td></tr>
              <tr><td>Resolved</td><td style={{ fontWeight: 600, color: '#16a34a' }}>{resolvedCount}</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Fund Trail Timeline (Centre -> Ministry -> State -> District -> Beneficiary)">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            placeholder="Filter by Scheme ID (optional)"
            value={timelineSchemeId}
            onChange={(event) => setTimelineSchemeId(event.target.value)}
            style={{ minWidth: '260px' }}
          />
          <button className="btn secondary" type="button" onClick={() => loadTimeline(timelineSchemeId)}>
            {timelineLoading ? 'Loading...' : 'Load Timeline'}
          </button>
        </div>

        <div className="helper" style={{ display: 'grid', gap: '6px', marginBottom: '10px' }}>
          <div>Centre {'->'} Ministry: {(timeline?.stageTotals?.centreToMinistry || 0).toFixed(2)} Cr</div>
          <div>Ministry {'->'} State: {(timeline?.stageTotals?.ministryToState || 0).toFixed(2)} Cr</div>
          <div>State {'->'} District: {(timeline?.stageTotals?.stateToDistrict || 0).toFixed(2)} Cr</div>
          <div>District {'->'} Beneficiary: {(timeline?.stageTotals?.districtToBeneficiary || 0).toFixed(2)} Cr</div>
          <div>Gap (State {'->'} District minus Beneficiary): {(timeline?.leakageGapCrore || 0).toFixed(2)} Cr</div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Level</th>
              <th>ID</th>
              <th>Scheme</th>
              <th>Amount (Cr)</th>
              <th>TX Hash</th>
              <th>Block</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {!timeline?.timeline?.length ? (
              <tr>
                <td colSpan={8} className="helper">No timeline records found for current scope/filter.</td>
              </tr>
            ) : (
              timeline.timeline.map((item) => (
                <tr key={`${item.type}-${item.transactionId || item.paymentId}`}>
                  <td><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: item.type === 'payment' ? 'rgba(22,182,164,0.08)' : 'rgba(15,74,167,0.08)' }}>{item.type}</span></td>
                  <td style={{ fontSize: '12px' }}>{item.level?.replace(/_admin/g, '')}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{item.transactionId || item.paymentId}</td>
                  <td style={{ fontSize: '12px' }}>{item.schemeName || item.schemeId}</td>
                  <td style={{ fontWeight: 600 }}>{Number(item.amountCrore || 0).toFixed(2)}</td>
                  <td style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                    {item.blockchainTxHash && item.blockchainTxHash !== 'PENDING' ? (
                      <a href={`${ETHERSCAN}/tx/${item.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0f4aa7' }}>{item.blockchainTxHash.slice(0, 14)}...</a>
                    ) : <span style={{ opacity: 0.4 }}>PENDING</span>}
                  </td>
                  <td>
                    {item.blockNumber ? (
                      <a href={`${ETHERSCAN}/block/${item.blockNumber}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0f4aa7', fontSize: '12px' }}>#{item.blockNumber}</a>
                    ) : '-'}
                  </td>
                  <td style={{ fontSize: '11px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
