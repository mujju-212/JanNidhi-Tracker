import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const districts = [
  {
    name: 'Pune',
    collector: 'Shri Rajesh Patil',
    wallet: '0x7b9a...4421',
    released: 480,
    utilization: 62,
    status: 'active'
  },
  {
    name: 'Nashik',
    collector: 'Smt. Kavita Rao',
    wallet: '0x2d8c...0081',
    released: 320,
    utilization: 54,
    status: 'active'
  },
  {
    name: 'Nagpur',
    collector: 'Shri Vivek Kulkarni',
    wallet: '0x5a1f...7709',
    released: 210,
    utilization: 38,
    status: 'watch'
  }
];

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function STDistrictList() {
  return (
    <Card
      title="District Accounts"
      action={
        <Link className="btn" to="/state/create-district">
          Create District
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>District</th>
            <th>Collector</th>
            <th>Wallet</th>
            <th>Released (Cr)</th>
            <th>Utilization</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {districts.map((district) => (
            <tr key={district.name}>
              <td>{district.name}</td>
              <td>{district.collector}</td>
              <td>{district.wallet}</td>
              <td>Rs {district.released}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${district.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(district.status)} label={district.status.toUpperCase()} />
              </td>
              <td>
                <Link className="btn secondary" to="/state/district-progress">
                  View Progress
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
