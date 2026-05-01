import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const ministries = {
  mohfw: {
    id: 'mohfw',
    name: 'Ministry of Health & Family Welfare',
    code: 'MOHFW',
    hod: 'Dr. Mansukh Mandaviya',
    email: 'sec.mohfw@gov.in',
    phone: '+91-11-2309-0001',
    wallet: '0x4a9f...1b2c',
    status: 'active',
    budgetCap: 89155,
    allocated: 22186,
    released: 18400,
    utilized: 16210,
    schemes: [
      {
        id: 'SCH-AB-2024',
        name: 'Ayushman Bharat',
        type: 'CSS 60:40',
        budget: 7200,
        utilization: 68,
        status: 'active'
      },
      {
        id: 'SCH-NHM-2024',
        name: 'National Health Mission',
        type: 'CSS 60:40',
        budget: 5000,
        utilization: 61,
        status: 'active'
      }
    ],
    releases: [
      { id: 'REL-2024-09', state: 'Uttar Pradesh', amount: 2100, status: 'released' },
      { id: 'REL-2024-10', state: 'Maharashtra', amount: 1800, status: 'released' },
      { id: 'REL-2024-11', state: 'Bihar', amount: 1400, status: 'pending' }
    ]
  },
  moedu: {
    id: 'moedu',
    name: 'Ministry of Education',
    code: 'MOEDU',
    hod: 'Shri Sanjay Kumar',
    email: 'sec.education@gov.in',
    phone: '+91-11-2309-0002',
    wallet: '0x9c1d...7a88',
    status: 'active',
    budgetCap: 64500,
    allocated: 14500,
    released: 12800,
    utilized: 11050,
    schemes: [
      {
        id: 'SCH-POSHAN-2024',
        name: 'PM POSHAN',
        type: 'Central 100%',
        budget: 6000,
        utilization: 72,
        status: 'active'
      }
    ],
    releases: [
      { id: 'REL-2024-15', state: 'Rajasthan', amount: 1250, status: 'released' },
      { id: 'REL-2024-16', state: 'Tamil Nadu', amount: 990, status: 'pending' }
    ]
  }
};

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function SAMinistryDetail() {
  const { ministryId } = useParams();
  const ministry = ministries[ministryId] || ministries.mohfw;

  const releaseProgress = Math.round((ministry.released / ministry.budgetCap) * 100);
  const utilizationProgress = Math.round((ministry.utilized / ministry.released) * 100);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Ministry Profile"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link className="btn secondary" to="/superadmin/transactions">
              View Transactions
            </Link>
            <Link className="btn" to="/superadmin/reports">
              Generate Report
            </Link>
          </div>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div>
            <div className="helper">Ministry</div>
            <div style={{ fontWeight: 600 }}>{ministry.name}</div>
          </div>
          <div>
            <div className="helper">Code</div>
            <div>{ministry.code}</div>
          </div>
          <div>
            <div className="helper">Head of Department</div>
            <div>{ministry.hod}</div>
          </div>
          <div>
            <div className="helper">Wallet</div>
            <div>{ministry.wallet}</div>
          </div>
          <div>
            <div className="helper">Contact</div>
            <div>{ministry.email}</div>
            <div>{ministry.phone}</div>
          </div>
          <div>
            <div className="helper">Status</div>
            <Badge tone={statusTone(ministry.status)} label={ministry.status.toUpperCase()} />
          </div>
        </div>
      </Card>

      <div className="grid two">
        <Card title="Budget Snapshot">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Budget Cap: Rs {ministry.budgetCap} Cr</div>
            <div>Allocated: Rs {ministry.allocated} Cr</div>
            <div>Released: Rs {ministry.released} Cr</div>
            <div>Utilized: Rs {ministry.utilized} Cr</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Released vs Cap ({releaseProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${releaseProgress}%` }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Utilization ({utilizationProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${utilizationProgress}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Release Schedule">
          <table className="table">
            <thead>
              <tr>
                <th>Release ID</th>
                <th>State</th>
                <th>Amount (Cr)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ministry.releases.map((release) => (
                <tr key={release.id}>
                  <td>{release.id}</td>
                  <td>{release.state}</td>
                  <td>Rs {release.amount}</td>
                  <td>
                    <Badge
                      tone={release.status === 'released' ? 'low' : 'medium'}
                      label={release.status.toUpperCase()}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Active Schemes">
        <table className="table">
          <thead>
            <tr>
              <th>Scheme ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Budget (Cr)</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ministry.schemes.map((scheme) => (
              <tr key={scheme.id}>
                <td>{scheme.id}</td>
                <td>{scheme.name}</td>
                <td>{scheme.type}</td>
                <td>Rs {scheme.budget}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
