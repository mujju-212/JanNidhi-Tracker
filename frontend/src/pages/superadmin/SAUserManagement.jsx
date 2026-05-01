import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const auditors = [
  {
    id: 'CAG-2024-001',
    name: 'Shri G. K. Pillai',
    role: 'Central CAG',
    jurisdiction: 'All India',
    status: 'active',
    lastLogin: '20 May 2024'
  },
  {
    id: 'CAG-2024-014',
    name: 'Smt. R. Meenakshi',
    role: 'State Auditor',
    jurisdiction: 'Tamil Nadu',
    status: 'active',
    lastLogin: '19 May 2024'
  },
  {
    id: 'CAG-2024-022',
    name: 'Shri P. Verma',
    role: 'State Auditor',
    jurisdiction: 'Uttar Pradesh',
    status: 'pending',
    lastLogin: 'Pending activation'
  }
];

const ministries = [
  {
    id: 'mohfw',
    name: 'MoHFW',
    hod: 'Dr. Mansukh Mandaviya',
    email: 'sec.mohfw@gov.in',
    status: 'active',
    wallet: '0x4a9f...1b2c'
  },
  {
    id: 'moedu',
    name: 'MoEdu',
    hod: 'Shri Sanjay Kumar',
    email: 'sec.education@gov.in',
    status: 'active',
    wallet: '0x9c1d...7a88'
  },
  {
    id: 'moagri',
    name: 'MoAgri',
    hod: 'Shri Sanjay Agarwal',
    email: 'sec.agri@gov.in',
    status: 'suspended',
    wallet: '0x1f2e...9c03'
  }
];

const statusTone = (status) => {
  if (status === 'active') return 'low';
  if (status === 'pending') return 'medium';
  return 'high';
};

export default function SAUserManagement() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="CAG Auditor Accounts"
        action={
          <Link className="btn" to="/superadmin/create-cag">
            Create CAG Account
          </Link>
        }
      >
        <table className="table">
          <thead>
            <tr>
              <th>Auditor ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Jurisdiction</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auditors.map((auditor) => (
              <tr key={auditor.id}>
                <td>{auditor.id}</td>
                <td>{auditor.name}</td>
                <td>{auditor.role}</td>
                <td>{auditor.jurisdiction}</td>
                <td>
                  <Badge tone={statusTone(auditor.status)} label={auditor.status.toUpperCase()} />
                </td>
                <td>{auditor.lastLogin}</td>
                <td>
                  <button className="btn secondary" type="button">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card
        title="Ministry Accounts"
        action={
          <Link className="btn secondary" to="/superadmin/create-ministry">
            Create Ministry
          </Link>
        }
      >
        <table className="table">
          <thead>
            <tr>
              <th>Ministry</th>
              <th>HOD</th>
              <th>Official Email</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ministries.map((ministry) => (
              <tr key={ministry.id}>
                <td>{ministry.name}</td>
                <td>{ministry.hod}</td>
                <td>{ministry.email}</td>
                <td>{ministry.wallet}</td>
                <td>
                  <Badge tone={statusTone(ministry.status)} label={ministry.status.toUpperCase()} />
                </td>
                <td>
                  <Link className="btn secondary" to={`/superadmin/ministry/${ministry.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
