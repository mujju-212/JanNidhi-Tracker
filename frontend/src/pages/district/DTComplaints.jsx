import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function DTComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/district/complaints')
      .then((res) => setComplaints(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading complaints...</div>;

  return (
    <Card title={`Citizen Complaints (${complaints.length})`}>
      <table className="table">
        <thead><tr><th>Complaint ID</th><th>Scheme</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {complaints.length === 0 && <tr><td colSpan={5} className="helper">No complaints</td></tr>}
          {complaints.map((c) => (
            <tr key={c._id}>
              <td style={{ fontSize: '12px', fontWeight: 600 }}>{c.complaintId}</td>
              <td>{c.schemeId}</td>
              <td style={{ fontSize: '12px', maxWidth: '250px' }}>{c.description?.slice(0, 80)}</td>
              <td style={{ color: c.status === 'resolved' ? '#16a34a' : '#f59e0b' }}>{c.status}</td>
              <td style={{ fontSize: '12px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
