import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'ready' ? 'low' : 'medium');

export default function STReports() {
  const [reportType, setReportType] = useState('District Release');
  const [period, setPeriod] = useState(() => {
    try {
      return `FY ${localStorage.getItem('jn_selected_fy') || '2024-25'}`;
    } catch {
      return 'FY 2024-25';
    }
  });
  const [transactions, setTransactions] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/state/transactions'), apiGet('/api/state/flags')])
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

  const reports = useMemo(() => {
    const confirmed = transactions.filter((item) => item.status === 'confirmed');
    const totalReleased = confirmed
      .filter((item) => item.fromRole === 'state_admin')
      .reduce((sum, item) => sum + Number(item.amountCrore || 0), 0);
    const totalReceived = confirmed
      .filter((item) => item.toRole === 'state_admin')
      .reduce((sum, item) => sum + Number(item.amountCrore || 0), 0);

    return [
      {
        id: `ST-RPT-${Date.now()}`,
        name: `${reportType} Summary`,
        period,
        status: 'ready',
        generatedOn: new Date().toLocaleDateString(),
        detail: `Received: ${totalReceived.toFixed(2)} Cr, Released: ${totalReleased.toFixed(2)} Cr, Open Flags: ${flags.filter((item) => item.status !== 'resolved').length}`
      }
    ];
  }, [transactions, flags, reportType, period]);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Generate State Report" action={<button className="btn">Generate</button>}>
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
              <option>District Release</option>
              <option>UC Compliance</option>
              <option>Payment Exceptions</option>
              <option>Flag Summary</option>
            </select>
          </div>
          <div className="form-group">
            <label>Period</label>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option>FY 2024-25</option>
              <option>Q1 2024</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
        <div className="helper" style={{ marginTop: '10px' }}>
          Selected: {reportType} ({period})
        </div>
      </Card>

      <Card title="Recent Reports">
        <table className="table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Name</th>
              <th>Period</th>
              <th>Status</th>
              <th>Generated On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="helper">Generating report...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="6" className="helper">{error}</td>
            </tr>
          ) : null}
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.name}</td>
                <td>{report.period}</td>
                <td>
                  <Badge tone={statusTone(report.status)} label={report.status.toUpperCase()} />
                </td>
                <td>{report.generatedOn}</td>
                <td>
                  <button className="btn secondary" type="button">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          {!loading && !error && !reports.length ? (
            <tr>
              <td colSpan="6" className="helper">No reports available.</td>
            </tr>
          ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
