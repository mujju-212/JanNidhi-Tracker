import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function CAGReports() {
  const [leakage, setLeakage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [leakRes, txRes, flagRes] = await Promise.all([
          apiGet('/api/auditor/leakage'),
          apiGet('/api/auditor/transactions'),
          apiGet('/api/auditor/flags')
        ]);
        setLeakage(leakRes?.data || {});
        setTransactions(txRes?.data || []);
        setFlags(flagRes?.data || []);
      } catch (err) {
        console.error('Reports load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
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
    </div>
  );
}
