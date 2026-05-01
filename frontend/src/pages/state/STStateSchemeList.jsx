import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const schemes = [
  {
    id: 'MH-STATE-2024-01',
    name: 'Maharashtra Farmer Relief',
    budget: 1200,
    progress: 58,
    status: 'active'
  },
  {
    id: 'MH-STATE-2024-02',
    name: 'State Health Voucher',
    budget: 800,
    progress: 42,
    status: 'under_review'
  }
];

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function STStateSchemeList() {
  return (
    <Card
      title="State Schemes"
      action={
        <Link className="btn" to="/state/create-state-scheme">
          Create Scheme
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Scheme ID</th>
            <th>Name</th>
            <th>Budget (Cr)</th>
            <th>Utilization</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {schemes.map((scheme) => (
            <tr key={scheme.id}>
              <td>{scheme.id}</td>
              <td>{scheme.name}</td>
              <td>Rs {scheme.budget}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${scheme.progress}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(scheme.status)} label={scheme.status.toUpperCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
