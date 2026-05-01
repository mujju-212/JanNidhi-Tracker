import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function SAMinistryList() {
  const [query, setQuery] = useState('');
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/superadmin/ministry/all')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        const mapped = items.map((item) => ({
          id: item._id || item.jurisdiction?.ministryCode || item.email,
          name: item.jurisdiction?.ministry || 'Ministry',
          hod: item.fullName,
          wallet: item.walletAddress || '-',
          budgetCap: item.budgetCapCrore ?? 0,
          used: null,
          status: item.isActive ? 'active' : 'inactive'
        }));
        setMinistries(mapped);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load ministries.');
        setMinistries([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ministries;
    return ministries.filter((ministry) =>
      ministry.name.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <Card
      title="All Ministries"
      action={
        <Link className="btn" to="/superadmin/create-ministry">
          Create Ministry
        </Link>
      }
    >
      <div className="form-group" style={{ maxWidth: '320px' }}>
        <label>Search</label>
        <input
          placeholder="Search ministry"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Ministry</th>
            <th>HOD</th>
            <th>Wallet</th>
            <th>Budget Cap (Cr)</th>
            <th>Used (Cr)</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="helper">
                Loading ministries...
              </td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="7" className="helper">
                {error}
              </td>
            </tr>
          ) : null}
          {filtered.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.hod}</td>
              <td>{item.wallet}</td>
              <td>Rs {item.budgetCap}</td>
              <td>{item.used === null ? '-' : `Rs ${item.used}`}</td>
              <td>
                <Badge
                  tone={item.status === 'active' ? 'low' : 'medium'}
                  label={item.status.toUpperCase()}
                />
              </td>
              <td>
                <Link className="btn secondary" to={`/superadmin/ministry/${item.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
