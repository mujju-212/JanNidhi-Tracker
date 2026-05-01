import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'ready' ? 'low' : 'medium');

export default function SAMasterReports() {
  const [reportType, setReportType] = useState('Ministry Utilization');
  const [scope, setScope] = useState('All Ministries');
  const [period, setPeriod] = useState('FY 2024-25');
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/superadmin/transactions'), apiGet('/api/superadmin/flags')])
      .then(([txResponse, flagResponse]) => {
        if (!mounted) return;
        setTransactions(txResponse?.data || []);
        setFlags(flagResponse?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load report data.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const confirmed = transactions.filter((tx) => tx.status === 'confirmed');
    const totalValue = confirmed.reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);
    const flagged = confirmed.filter((tx) => tx.isFlagged).length;
    const unresolvedFlags = flags.filter((flag) => flag.status !== 'resolved').length;
    return { totalValue, flagged, unresolvedFlags, txCount: confirmed.length };
  }, [transactions, flags]);

  const handleGenerate = () => {
    const now = new Date();
    const report = {
      id: `RPT-${now.getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`,
      name: reportType,
      scope,
      period,
      status: 'ready',
      generatedOn: now.toLocaleDateString(),
      payload: {
        totalConfirmedTransactions: summary.txCount,
        totalFlowCrore: Number(summary.totalValue.toFixed(2)),
        flaggedTransactions: summary.flagged,
        unresolvedFlags: summary.unresolvedFlags
      }
    };
    setReports((prev) => [report, ...prev]);
  };

  const downloadReport = (report) => {
    const lines = [
      'key,value',
      `report_id,${report.id}`,
      `report_name,${report.name}`,
      `scope,${report.scope}`,
      `period,${report.period}`,
      `generated_on,${report.generatedOn}`,
      `confirmed_transactions,${report.payload.totalConfirmedTransactions}`,
      `total_flow_crore,${report.payload.totalFlowCrore}`,
      `flagged_transactions,${report.payload.flaggedTransactions}`,
      `unresolved_flags,${report.payload.unresolvedFlags}`
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${report.id}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Generate National Report" action={<button className="btn" onClick={handleGenerate}>Generate Report</button>}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          <div className="form-group">
            <label>Report Type</label>
            <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
              <option>Ministry Utilization</option>
              <option>Scheme Leakage</option>
              <option>State Release Compliance</option>
              <option>Audit Flags Summary</option>
              <option>Beneficiary Reach Report</option>
            </select>
          </div>
          <div className="form-group">
            <label>Scope</label>
            <select value={scope} onChange={(event) => setScope(event.target.value)}>
              <option>All Ministries</option>
              <option>Top 10 Ministries</option>
              <option>Ayushman Bharat</option>
              <option>PM-KISAN</option>
            </select>
          </div>
          <div className="form-group">
            <label>Period</label>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option>FY 2024-25</option>
              <option>Q1 2024</option>
              <option>Q2 2024</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
        <div className="helper" style={{ marginTop: '10px' }}>
          Selected: {reportType} for {scope} ({period})
        </div>
        {loading ? <div className="helper" style={{ marginTop: '10px' }}>Loading source data...</div> : null}
        {error ? <div className="alert" style={{ marginTop: '10px' }}>{error}</div> : null}
      </Card>

      <Card title="Live Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Confirmed Transactions: {summary.txCount}</div>
          <div>Total Flow: Rs {summary.totalValue.toFixed(2)} Cr</div>
          <div>Flagged Transactions: {summary.flagged}</div>
          <div>Unresolved Flags: {summary.unresolvedFlags}</div>
        </div>
      </Card>

      <Card title="Recent Reports">
        <table className="table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Name</th>
              <th>Scope</th>
              <th>Period</th>
              <th>Status</th>
              <th>Generated On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.name}</td>
                <td>{report.scope}</td>
                <td>{report.period}</td>
                <td>
                  <Badge tone={statusTone(report.status)} label={report.status.toUpperCase()} />
                </td>
                <td>{report.generatedOn}</td>
                <td>
                  <button className="btn secondary" type="button" onClick={() => downloadReport(report)}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
            {!reports.length ? (
              <tr>
                <td colSpan="7" className="helper">
                  No generated reports yet. Choose filters and click Generate Report.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
