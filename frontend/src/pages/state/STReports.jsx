import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const reports = [
  {
    id: 'ST-RPT-2024-05',
    name: 'District Release Summary',
    period: 'Q1 2024',
    status: 'ready',
    generatedOn: '19 May 2024'
  },
  {
    id: 'ST-RPT-2024-04',
    name: 'Beneficiary Exceptions',
    period: 'Last 30 Days',
    status: 'processing',
    generatedOn: '18 May 2024'
  }
];

const statusTone = (status) => (status === 'ready' ? 'low' : 'medium');

export default function STReports() {
  const [reportType, setReportType] = useState('District Release');
  const [period, setPeriod] = useState('FY 2024-25');

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
