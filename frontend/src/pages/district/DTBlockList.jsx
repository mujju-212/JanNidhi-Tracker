import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const blocks = [
  {
    name: 'Haveli',
    officer: 'Shri Suresh Kale',
    wallet: '0x3f9a...11c9',
    utilization: 64,
    status: 'active'
  },
  {
    name: 'Mulshi',
    officer: 'Smt. Kavita Patil',
    wallet: '0x1b5c...0a21',
    utilization: 51,
    status: 'active'
  },
  {
    name: 'Purandar',
    officer: 'Shri Vivek Rao',
    wallet: '0x9a1f...77d3',
    utilization: 39,
    status: 'watch'
  }
];

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function DTBlockList() {
  return (
    <Card
      title="Block Accounts"
      action={
        <Link className="btn" to="/district/create-block">
          Create Block
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Block</th>
            <th>Officer</th>
            <th>Wallet</th>
            <th>Utilization</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.name}>
              <td>{block.name}</td>
              <td>{block.officer}</td>
              <td>{block.wallet}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${block.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(block.status)} label={block.status.toUpperCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
