import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet, apiPut } from '../../services/api.js';

export default function CAGFlagManagement() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deciding, setDeciding] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [msg, setMsg] = useState('');

  const loadFlags = async () => {
    try {
      const url = filter ? `/api/auditor/flags?status=${filter}` : '/api/auditor/flags';
      const res = await apiGet(url);
      setFlags(res?.data || []);
    } catch (err) {
      console.error('Flags load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFlags(); }, [filter]);

  const handleDecide = async (flagId, decision) => {
    try {
      await apiPut(`/api/auditor/flag/${flagId}/decide`, {
        decision,
        decisionNote: decisionNote || `${decision} by CAG auditor`
      });
      setMsg(`Flag ${flagId} → ${decision}`);
      setDeciding(null);
      setDecisionNote('');
      setLoading(true);
      loadFlags();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading flags...</div>;

  return (
    <div className="grid" style={{ gap: '16px' }}>
      <Card title={`Flag Management (${flags.length} total)`}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['', 'active', 'awaiting_response', 'under_review', 'resolved', 'escalated'].map((s) => (
            <button key={s} className={`btn ${filter === s ? '' : 'secondary'}`} onClick={() => { setFilter(s); setLoading(true); }}
              style={{ fontSize: '12px', padding: '6px 12px' }}>
              {s || 'All'}
            </button>
          ))}
        </div>
        {msg && <div className="alert" style={{ marginBottom: '12px' }}>{msg}</div>}

        <table className="table">
          <thead>
            <tr>
              <th>Flag ID</th>
              <th>Type</th>
              <th>Code</th>
              <th>Reason</th>
              <th>Ministry</th>
              <th>State</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {flags.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No flags found</td></tr>}
            {flags.map((flag) => (
              <tr key={flag._id}>
                <td style={{ fontSize: '12px', fontWeight: 600 }}>{flag.flagId}</td>
                <td><Badge tone={flag.flagType} label={flag.flagType?.toUpperCase()} /></td>
                <td style={{ fontSize: '12px' }}>{flag.flagCode}</td>
                <td style={{ fontSize: '12px', maxWidth: '200px' }}>{flag.flagReason?.slice(0, 80)}</td>
                <td style={{ fontSize: '12px' }}>{flag.ministryCode || '-'}</td>
                <td style={{ fontSize: '12px' }}>{flag.stateCode || '-'}</td>
                <td><Badge tone={flag.status === 'resolved' ? 'low' : 'medium'} label={flag.status?.replace(/_/g, ' ')} /></td>
                <td>
                  {flag.status !== 'resolved' ? (
                    deciding === flag.flagId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
                        <input placeholder="Decision note" value={decisionNote}
                          onChange={(e) => setDecisionNote(e.target.value)} style={{ fontSize: '12px' }} />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn" style={{ fontSize: '11px', padding: '4px 8px', background: '#16a34a' }}
                            onClick={() => handleDecide(flag.flagId, 'resolved')}>Resolve</button>
                          <button className="btn" style={{ fontSize: '11px', padding: '4px 8px', background: '#dc2626' }}
                            onClick={() => handleDecide(flag.flagId, 'escalated')}>Escalate</button>
                          <button className="btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => setDeciding(null)}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn secondary" style={{ fontSize: '12px' }}
                        onClick={() => setDeciding(flag.flagId)}>Review</button>
                    )
                  ) : (
                    <span style={{ fontSize: '12px', color: '#16a34a' }}>✓ Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
