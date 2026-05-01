import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'ready' ? 'low' : 'medium');

export default function MinReports() {
  const [reportType, setReportType] = useState('State Utilization');
  const [period, setPeriod] = useState(() => {
    try {
      return `FY ${localStorage.getItem('jn_selected_fy') || '2024-25'}`;
    } catch {
      return 'FY 2024-25';
    }
  });
  const [reportRows, setReportRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const fy = period.replace('FY ', '').trim();
      const response = await apiGet(`/api/ministry/reports?financialYear=${encodeURIComponent(fy)}`);
      const payload = response?.data || {};
      setReportRows([
        {
          id: `MIN-RPT-${Date.now()}`,
          name: `${reportType} Report`,
          period,
          status: 'ready',
          generatedOn: new Date().toLocaleDateString(),
          payload
        }
      ]);
    } catch (err) {
      setError(err.message || 'Unable to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Generate Ministry Report"
        action={
          <button className="btn" type="button" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        }
      >
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
              <option>State Utilization</option>
              <option>Scheme Compliance</option>
              <option>Payment Exceptions</option>
              <option>Flag Summary</option>
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
          Selected: {reportType} ({period})
        </div>
        {error ? <div className="alert">{error}</div> : null}
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
            {reportRows.map((report) => (
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
            {!loading && !error && !reportRows.length ? (
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
