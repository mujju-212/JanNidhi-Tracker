import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

const codes = [
  'AMOUNT_MISMATCH',
  'UNKNOWN_WALLET',
  'SPEED_ANOMALY',
  'DUPLICATE_PAYMENT',
  'ROUND_FIGURE',
  'INACTIVE_SCHEME',
  'DEADLINE_BREACH',
  'OTHER'
];

export default function CAGRaiseFlag() {
  const [code, setCode] = useState(codes[0]);

  return (
    <Card title="Raise Manual Flag">
      <div className="form-group">
        <label>Transaction ID</label>
        <input placeholder="TXN-2024-001" />
      </div>
      <div className="form-group">
        <label>Flag Type</label>
        <select>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Info</option>
        </select>
      </div>
      <div className="form-group">
        <label>Flag Code</label>
        <select value={code} onChange={(event) => setCode(event.target.value)}>
          {codes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Reason</label>
        <textarea rows="4" placeholder="Describe the issue" />
      </div>
      <div className="form-group">
        <label>Response Deadline</label>
        <input placeholder="7 days" />
      </div>
      <button className="btn">Raise Flag</button>
    </Card>
  );
}
