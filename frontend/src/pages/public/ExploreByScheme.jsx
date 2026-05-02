import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN');
};

export default function ExploreByScheme() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/public/schemes')
      .then((res) => setSchemes(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading schemes...</div>;

  return (
    <Card title={`Government Schemes (${schemes.length})`}>
      <table className="table">
        <thead><tr><th>Scheme</th><th>Ministry</th><th>Budget (Cr)</th><th>Duration</th><th>Action</th></tr></thead>
        <tbody>
          {schemes.length === 0 && <tr><td colSpan={5} className="helper">No schemes</td></tr>}
          {schemes.map((s) => (
            <tr key={s.schemeId}>
              <td><strong>{s.schemeName}</strong><br /><span style={{ fontSize: '11px', opacity: 0.6 }}>{s.schemeId}</span></td>
              <td style={{ fontSize: '12px' }}>{s.ownerMinistryName}</td>
              <td>Rs {s.totalBudgetCrore} Cr</td>
              <td style={{ fontSize: '12px' }}>{formatDate(s.startDate)} - {formatDate(s.endDate)}</td>
              <td>
                <Link className="btn secondary" to={`/public/schemes/${s.schemeId}`} style={{ fontSize: '12px' }}>
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
