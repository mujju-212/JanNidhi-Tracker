import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => {
  if (status === 'active') return 'low';
  if (status === 'pending') return 'medium';
  return 'high';
};

export default function SAUserManagement() {
  const [users, setUsers] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([apiGet('/api/superadmin/users'), apiGet('/api/superadmin/ministry/all')])
      .then(([usersResponse, ministriesResponse]) => {
        if (!mounted) return;
        setUsers(usersResponse?.data || []);
        setMinistries(ministriesResponse?.data || []);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load user data.');
        setUsers([]);
        setMinistries([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const auditors = useMemo(
    () =>
      users
        .filter((item) => ['central_cag', 'state_auditor'].includes(item.role))
        .map((item) => ({
          id: item.employeeId || item._id,
          name: item.fullName,
          role: item.role === 'central_cag' ? 'Central CAG' : 'State Auditor',
          jurisdiction: item.role === 'central_cag' ? 'All India' : item.jurisdiction?.state || '-',
          status: item.isActive ? 'active' : 'pending',
          lastLogin: item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : 'Never'
        })),
    [users]
  );

  const ministryRows = useMemo(
    () =>
      ministries.map((item) => ({
        id: item._id || item.jurisdiction?.ministryCode,
        code: item.jurisdiction?.ministryCode,
        name: item.jurisdiction?.ministry || item.fullName,
        hod: item.fullName,
        email: item.email,
        status: item.isActive ? 'active' : 'suspended',
        wallet: item.walletAddress || '-'
      })),
    [ministries]
  );

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
        {loading ? <div className="helper">Loading auditor accounts...</div> : null}
        {error ? <div className="alert">{error}</div> : null}
        <div className="table-wrap">
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
            {!loading && !auditors.length ? (
              <tr>
                <td colSpan="7" className="helper">No CAG auditor accounts found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </Card>

      <Card
        title="Ministry Accounts"
        action={
          <Link className="btn secondary" to="/superadmin/create-ministry">
            Create Ministry
          </Link>
        }
      >
        {loading ? <div className="helper">Loading ministry accounts...</div> : null}
        <div className="table-wrap">
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
            {ministryRows.map((ministry) => (
              <tr key={ministry.id}>
                <td>{ministry.name}</td>
                <td>{ministry.hod}</td>
                <td>{ministry.email}</td>
                <td className="wallet-cell">{ministry.wallet}</td>
                <td>
                  <Badge tone={statusTone(ministry.status)} label={ministry.status.toUpperCase()} />
                </td>
                <td>
                  <Link className="btn secondary" to={`/superadmin/ministry/${ministry.code || ministry.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && !ministryRows.length ? (
              <tr>
                <td colSpan="6" className="helper">No ministry accounts found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
