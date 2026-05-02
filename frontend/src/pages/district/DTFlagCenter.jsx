import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function DTFlagCenter() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/flags')
      .then((res) => setFlags(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading flags...</div>;

  return (
    <Card title={`District Flags (${flags.length})`}>
      <table className="table">
        <thead><tr><th>Flag ID</th><th>Type</th><th>Code</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>
          {flags.length === 0 && <tr><td colSpan={5} className="helper">No flags — all clear</td></tr>}
          {flags.map((f) => (
            <tr key={f._id}>
              <td style={{ fontSize: '12px', fontWeight: 600 }}>{f.flagId}</td>
              <td><Badge tone={f.flagType} label={f.flagType?.toUpperCase()} /></td>
              <td style={{ fontSize: '12px' }}>{f.flagCode}</td>
              <td style={{ fontSize: '12px', maxWidth: '200px' }}>{f.flagReason?.slice(0, 80)}</td>
              <td><Badge tone={f.status === 'resolved' ? 'low' : 'medium'} label={f.status?.replace(/_/g, ' ')} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
