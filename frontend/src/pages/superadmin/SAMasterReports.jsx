import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const recentReports = [
  {
    id: 'RPT-2024-118',
    name: 'Ministry Utilization Summary',
    scope: 'All Ministries',
    period: 'FY 2024-25',
    status: 'ready',
    generatedOn: '20 May 2024'
  },
  {
    id: 'RPT-2024-117',
    name: 'State Release Compliance',
    scope: 'Top 10 States',
    period: 'Q1 2024',
    status: 'processing',
    generatedOn: '19 May 2024'
  },
  {
    id: 'RPT-2024-116',
    name: 'Scheme Leakage Analysis',
    scope: 'Ayushman Bharat',
    period: 'FY 2024-25',
    status: 'ready',
    generatedOn: '18 May 2024'
  }
];

const statusTone = (status) => (status === 'ready' ? 'low' : 'medium');

export default function SAMasterReports() {
  const [reportType, setReportType] = useState('Ministry Utilization');
  const [scope, setScope] = useState('All Ministries');
  const [period, setPeriod] = useState('FY 2024-25');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Generate National Report" action={<button className="btn">Generate Report</button>}>
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
            {recentReports.map((report) => (
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
