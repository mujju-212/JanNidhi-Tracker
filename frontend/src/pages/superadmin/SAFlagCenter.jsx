import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

export default function SAFlagCenter() {
  const [filter, setFilter] = useState('all');
  const [flags, setFlags] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/superadmin/flags')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        const mapped = items.map((flag) => ({
          id: flag.flagId,
          type: flag.flagType,
          code: flag.flagCode,
          reason: flag.flagReason,
          transaction: flag.transactionId,
          ministry: flag.ministryCode || '-',
          state: flag.stateCode || '-',
          district: flag.districtCode || '-',
          raisedBy: flag.raisedByType || '-',
          status: flag.status || '-',
          date: flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : '-',
          responseDeadline: flag.responseDeadline,
          adminResponseText: flag.adminResponse?.responseText || null,
          adminResponseDocHash: flag.adminResponse?.responseDocHash || null,
          cagDecision: flag.cagDecision?.decision || 'pending'
        }));
        setFlags(mapped);
        setSelectedFlag(mapped[0] || null);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load flags.');
        setFlags([]);
        setSelectedFlag(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = flags.filter((item) => filter === 'all' || item.type === filter);

  const deadlineText = (value) => {
    if (!value) return '-';
    const deadline = new Date(value).getTime();
    const now = Date.now();
    const diffMs = deadline - now;
    if (diffMs <= 0) return 'Expired';
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return `${days} day(s) left`;
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Flag Center" action={<button className="btn">Generate Report</button>}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {['all', 'critical', 'high', 'medium'].map((item) => (
          <button
            key={item}
            className={item === filter ? 'btn' : 'btn secondary'}
            onClick={() => setFilter(item)}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Flag ID</th>
            <th>Type</th>
            <th>Transaction</th>
            <th>Ministry</th>
            <th>State</th>
            <th>Raised By</th>
            <th>Status</th>
              <th>Deadline</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
                <td colSpan="10" className="helper">
                Loading flags...
              </td>
            </tr>
          ) : null}
          {error ? (
            <tr>
                <td colSpan="10" className="helper">
                {error}
              </td>
            </tr>
          ) : null}
          {filtered.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.id}</td>
              <td>
                <Badge tone={flag.type} label={flag.type.toUpperCase()} />
              </td>
              <td>{flag.transaction}</td>
              <td>{flag.ministry}</td>
              <td>{flag.state}</td>
              <td>{flag.raisedBy}</td>
              <td>{flag.status.replace('_', ' ')}</td>
              <td>{deadlineText(flag.responseDeadline)}</td>
              <td>{flag.date}</td>
              <td>
                <button className="btn secondary" onClick={() => setSelectedFlag(flag)}>
                  Review
                </button>
              </td>
            </tr>
          ))}
          {!loading && !error && filtered.length === 0 ? (
            <tr>
              <td colSpan="10" className="helper">No flags found for selected filter.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
      </Card>

      <Card title="Flag Detail">
        {selectedFlag ? (
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Flag ID: {selectedFlag.id}</div>
            <div>Flag Type / Code: {selectedFlag.type} / {selectedFlag.code}</div>
            <div>Reason: {selectedFlag.reason || '-'}</div>
            <div>Transaction: {selectedFlag.transaction}</div>
            <div>Jurisdiction: {selectedFlag.ministry} / {selectedFlag.state} / {selectedFlag.district}</div>
            <div>Response Deadline: {deadlineText(selectedFlag.responseDeadline)}</div>
            <div>Admin Response: {selectedFlag.adminResponseText || 'No response yet'}</div>
            <div>Admin Doc: {selectedFlag.adminResponseDocHash || '-'}</div>
            <div>CAG Decision: {selectedFlag.cagDecision}</div>
          </div>
        ) : (
          <div className="helper">Select a flag to review full details.</div>
        )}
      </Card>
    </div>
  );
}
