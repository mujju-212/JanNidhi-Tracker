import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const schemes = [
  {
    id: 'SCH-AB-2024',
    name: 'Ayushman Bharat',
    ministry: 'MoHFW',
    type: 'CSS 60:40',
    budget: 7200,
    released: 5600,
    utilization: 68,
    status: 'active'
  },
  {
    id: 'SCH-POSHAN-2024',
    name: 'PM POSHAN',
    ministry: 'MoEdu',
    type: 'Central 100%',
    budget: 6000,
    released: 4200,
    utilization: 62,
    status: 'under_review'
  },
  {
    id: 'SCH-PMK-2024',
    name: 'PM-KISAN',
    ministry: 'MoAgri',
    type: 'Central 100%',
    budget: 3500,
    released: 2100,
    utilization: 52,
    status: 'paused'
  }
];

const approvals = [
  {
    id: 'REQ-2024-17',
    name: 'Digital Health Mission',
    ministry: 'MoHFW',
    submitted: '20 May 2024',
    requestedBy: 'Dr. Mansukh Mandaviya'
  },
  {
    id: 'REQ-2024-18',
    name: 'National School Nutrition',
    ministry: 'MoEdu',
    submitted: '19 May 2024',
    requestedBy: 'Shri Sanjay Kumar'
  }
];

const alerts = [
  {
    id: 'ALT-2024-32',
    scheme: 'PM-KISAN',
    issue: 'Utilization below 55% in 3 states',
    severity: 'high'
  },
  {
    id: 'ALT-2024-33',
    scheme: 'Ayushman Bharat',
    issue: 'Delayed release in 2 quarters',
    severity: 'medium'
  }
];

const statusTone = (status) => {
  if (status === 'active') return 'low';
  if (status === 'under_review') return 'medium';
  return 'high';
};

export default function SASchemePlaceholder() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Scheme Portfolio" action={<button className="btn secondary">Export</button>}>
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
            <select>
              <option>All</option>
              <option>MoHFW</option>
              <option>MoEdu</option>
              <option>MoAgri</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select>
              <option>All</option>
              <option>active</option>
              <option>under review</option>
              <option>paused</option>
            </select>
          </div>
          <div className="form-group">
            <label>Scheme Type</label>
            <select>
              <option>All</option>
              <option>Central 100%</option>
              <option>CSS 60:40</option>
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Scheme ID</th>
              <th>Name</th>
              <th>Ministry</th>
              <th>Budget (Cr)</th>
              <th>Released (Cr)</th>
              <th>Utilization</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((scheme) => (
              <tr key={scheme.id}>
                <td>{scheme.id}</td>
                <td>{scheme.name}</td>
                <td>{scheme.ministry}</td>
                <td>Rs {scheme.budget}</td>
                <td>Rs {scheme.released}</td>
                <td>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${scheme.utilization}%` }}
                    />
                  </div>
                </td>
                <td>
                  <Badge tone={statusTone(scheme.status)} label={scheme.status.toUpperCase()} />
                </td>
                <td>
                  <button className="btn secondary" type="button">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid two">
        <Card title="Approval Queue" action={<span className="helper">2 pending</span>}>
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Scheme</th>
                <th>Ministry</th>
                <th>Submitted</th>
                <th>Requested By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.ministry}</td>
                  <td>{item.submitted}</td>
                  <td>{item.requestedBy}</td>
                  <td>
                    <button className="btn">Approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Scheme Alerts">
          <div style={{ display: 'grid', gap: '10px' }}>
            {alerts.map((alert) => (
              <div key={alert.id} className="card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{alert.scheme}</div>
                    <div className="helper">{alert.issue}</div>
                  </div>
                  <Badge tone={alert.severity} label={alert.severity.toUpperCase()} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
