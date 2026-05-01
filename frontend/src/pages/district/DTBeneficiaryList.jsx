import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function DTBeneficiaryList() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/beneficiaries')
      .then((res) => setBeneficiaries(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = beneficiaries.filter((b) =>
    !search || b.fullName?.toLowerCase().includes(search.toLowerCase()) || b.aadhaarMasked?.includes(search)
  );

  if (loading) return <div className="loading">Loading beneficiaries...</div>;

  return (
    <Card title={`Beneficiaries (${filtered.length})`}>
      <div className="form-group" style={{ maxWidth: '320px' }}>
        <label>Search</label>
        <input placeholder="Search by name or Aadhaar" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Aadhaar</th><th>Schemes</th><th>Bank</th><th>Village</th><th>Action</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={6} className="helper">No beneficiaries found</td></tr>}
          {filtered.map((b) => (
            <tr key={b._id}>
              <td>{b.fullName}</td>
              <td>{b.aadhaarMasked}</td>
              <td style={{ fontSize: '12px' }}>{(b.enrolledSchemes || []).map(s => s.schemeName || s.schemeId).join(', ')}</td>
              <td>{b.bankName}</td>
              <td>{b.village}</td>
              <td>
                <Link className="btn secondary" to={`/district/beneficiaries/${b._id}`} style={{ fontSize: '12px' }}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
