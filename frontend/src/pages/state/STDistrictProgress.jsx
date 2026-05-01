import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const progress = [
  {
    district: 'Pune',
    released: 480,
    utilized: 300,
    pendingUc: '4 panchayats',
    status: 'on-track'
  },
  {
    district: 'Nashik',
    released: 320,
    utilized: 190,
    pendingUc: '2 panchayats',
    status: 'on-track'
  },
  {
    district: 'Nagpur',
    released: 210,
    utilized: 80,
    pendingUc: '7 panchayats',
    status: 'watch'
  }
];

const statusTone = (status) => (status === 'on-track' ? 'low' : 'medium');

export default function STDistrictProgress() {
  return (
    <Card title="District Progress">
      <table className="table">
        <thead>
          <tr>
            <th>District</th>
            <th>Released (Cr)</th>
            <th>Utilized (Cr)</th>
            <th>Utilization</th>
            <th>Pending UCs</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((item) => (
            <tr key={item.district}>
              <td>{item.district}</td>
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
