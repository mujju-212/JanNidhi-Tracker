import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const ministries = [
  {
    id: 'mohfw',
    name: 'Ministry of Health & Family Welfare',
    hod: 'Dr. Mansukh Mandaviya',
    wallet: '0x4a9f...1b2c',
    budgetCap: '89155',
    used: '64210',
    status: 'active'
  },
  {
    id: 'moedu',
    name: 'Ministry of Education',
    hod: 'Shri Sanjay Kumar',
    wallet: '0x9c1d...7a88',
    budgetCap: '64500',
    used: '51200',
    status: 'active'
  },
  {
    id: 'moagri',
    name: 'Ministry of Agriculture',
    hod: 'Shri Sanjay Agarwal',
    wallet: '0x1f2e...9c03',
    budgetCap: '51200',
    used: '28500',
    status: 'inactive'
  }
];

export default function SAMinistryList() {
  const [query, setQuery] = useState('');

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
          {filtered.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.hod}</td>
              <td>{item.wallet}</td>
              <td>Rs {item.budgetCap}</td>
              <td>Rs {item.used}</td>
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
