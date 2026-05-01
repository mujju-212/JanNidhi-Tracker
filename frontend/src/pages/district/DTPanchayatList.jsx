import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const panchayats = [
  {
    name: 'Ambegaon',
    officer: 'Smt. Nita Deshmukh',
    wallet: '0x8f2a...5511',
    utilization: 57,
    status: 'active'
  },
  {
    name: 'Khed',
    officer: 'Shri Vikas Desai',
    wallet: '0x2d8c...0c21',
    utilization: 46,
    status: 'active'
  },
  {
    name: 'Junnar',
    officer: 'Smt. Riya Pawar',
    wallet: '0x5a1f...7711',
    utilization: 31,
    status: 'watch'
  }
];

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function DTPanchayatList() {
  return (
    <Card
      title="Panchayat Accounts"
      action={
        <Link className="btn" to="/district/create-panchayat">
          Create Panchayat
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Panchayat</th>
            <th>Officer</th>
            <th>Wallet</th>
            <th>Utilization</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {panchayats.map((panchayat) => (
            <tr key={panchayat.name}>
              <td>{panchayat.name}</td>
              <td>{panchayat.officer}</td>
              <td>{panchayat.wallet}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${panchayat.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(panchayat.status)} label={panchayat.status.toUpperCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
