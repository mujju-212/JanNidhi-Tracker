import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const progress = [
  {
    state: 'Uttar Pradesh',
    released: 1100,
    utilized: 720,
    pendingUc: '2 districts',
    status: 'on-track'
  },
  {
    state: 'Maharashtra',
    released: 900,
    utilized: 640,
    pendingUc: '1 district',
    status: 'on-track'
  },
  {
    state: 'Bihar',
    released: 600,
    utilized: 280,
    pendingUc: '6 districts',
    status: 'watch'
  }
];

const statusTone = (status) => (status === 'on-track' ? 'low' : 'medium');

export default function MinStateProgress() {
  return (
    <Card title="State-wise Progress">
      <table className="table">
        <thead>
          <tr>
            <th>State</th>
            <th>Released (Cr)</th>
            <th>Utilized (Cr)</th>
            <th>Utilization</th>
            <th>Pending UCs</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((item) => (
            <tr key={item.state}>
              <td>{item.state}</td>
              <td>Rs {item.released}</td>
              <td>Rs {item.utilized}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.round((item.utilized / item.released) * 100)}%` }}
                  />
                </div>
              </td>
              <td>{item.pendingUc}</td>
              <td>
                <Badge tone={statusTone(item.status)} label={item.status.replace('-', ' ').toUpperCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
