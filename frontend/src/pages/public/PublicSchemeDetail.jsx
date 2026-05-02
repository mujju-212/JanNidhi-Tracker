import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN');
};

export default function PublicSchemeDetail() {
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiGet(`/api/public/scheme/${schemeId}`)
      .then((response) => {
        if (active) {
          setScheme(response?.data || null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load scheme details.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [schemeId]);

  if (loading) return <div className="loading">Loading scheme details...</div>;
  if (error) return <div className="alert">{error}</div>;
  if (!scheme) return <div className="alert">Scheme not found.</div>;

  return (
    <div className="grid" style={{ gap: '16px' }}>
      <Card title={scheme.schemeName || 'Scheme Details'}>
        <div className="helper" style={{ display: 'grid', gap: '10px' }}>
          <div>Scheme ID: <strong>{scheme.schemeId || '-'}</strong></div>
          <div>Ministry: {scheme.ownerMinistryName || '-'}</div>
          <div>Budget: Rs {Number(scheme.totalBudgetCrore || 0).toFixed(2)} Cr</div>
          <div>Status: <strong>{scheme.status || 'unknown'}</strong></div>
          <div>Type: {scheme.schemeType ? scheme.schemeType.replace(/_/g, ' ') : '-'}</div>
          <div>Start Date: {formatDate(scheme.startDate)}</div>
          <div>End Date: {formatDate(scheme.endDate)}</div>
          <div>Description: {scheme.description || 'No public description available.'}</div>
        </div>
      </Card>

      <div>
        <Link className="btn secondary" to="/public/schemes">
          Back to schemes
        </Link>
      </div>
    </div>
  );
}
