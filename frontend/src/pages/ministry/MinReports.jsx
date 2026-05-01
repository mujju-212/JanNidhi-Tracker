import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const reports = [
  {
    id: 'MIN-RPT-2024-08',
    name: 'State Utilization Summary',
    period: 'Q1 2024',
    status: 'ready',
    generatedOn: '20 May 2024'
  },
  {
    id: 'MIN-RPT-2024-07',
    name: 'Scheme Leakage Check',
    period: 'FY 2024-25',
    status: 'processing',
    generatedOn: '19 May 2024'
  }
];

const statusTone = (status) => (status === 'ready' ? 'low' : 'medium');

export default function MinReports() {
  const [reportType, setReportType] = useState('State Utilization');
  const [period, setPeriod] = useState('FY 2024-25');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Generate Ministry Report" action={<button className="btn">Generate</button>}>
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
          </tbody>
        </table>
      </Card>
    </div>
  );
}
