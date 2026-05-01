import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';
const formatCrore = (value) => `Rs ${Number(value || 0).toFixed(2)} Cr`;

export default function STViewFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/state/funds')
      .then((response) => {
        if (!mounted) return;
        setFunds(response?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load funds.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card title="Funds Received">
      <table className="table">
        <thead>
          <tr>
            <th>Ministry</th>
            <th>Scheme</th>
            <th>Amount (Cr)</th>
            <th>Release Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="helper">Loading funds...</td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="5" className="helper">{error}</td>
            </tr>
          ) : null}
          {funds.map((fund) => (
            <tr key={fund._id}>
              <td>{fund.fromCode || fund.fromName || '-'}</td>
              <td>{fund.schemeName || fund.schemeId || '-'}</td>
              <td>{formatCrore(fund.amountCrore)}</td>
              <td>{fund.createdAt ? new Date(fund.createdAt).toLocaleDateString() : '-'}</td>
              <td>{fund.status || '-'}</td>
            </tr>
          ))}
          {!loading && !error && !funds.length ? (
            <tr>
              <td colSpan="5" className="helper">No fund records found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
