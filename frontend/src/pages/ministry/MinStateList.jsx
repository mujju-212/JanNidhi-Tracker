import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const states = [
  {
    name: 'Uttar Pradesh',
    officer: 'Shri Ajay Verma',
    wallet: '0x1a2b...7d90',
    released: 2100,
    utilization: 68,
    status: 'active'
  },
  {
    name: 'Maharashtra',
    officer: 'Smt. Priya Rao',
    wallet: '0x3b5c...2a19',
    released: 1800,
    utilization: 72,
    status: 'active'
  },
  {
    name: 'Bihar',
    officer: 'Shri Ravi Singh',
    wallet: '0x9f1d...1a77',
    released: 1400,
    utilization: 44,
    status: 'watch'
  }
];

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function MinStateList() {
  return (
    <Card
      title="State Accounts"
      action={
        <Link className="btn" to="/ministry/create-state">
          Create State
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>State</th>
            <th>Officer</th>
            <th>Wallet</th>
            <th>Released (Cr)</th>
            <th>Utilization</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {states.map((state) => (
            <tr key={state.name}>
              <td>{state.name}</td>
              <td>{state.officer}</td>
              <td>{state.wallet}</td>
              <td>Rs {state.released}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${state.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(state.status)} label={state.status.toUpperCase()} />
              </td>
              <td>
                <Link className="btn secondary" to="/ministry/state-progress">
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
