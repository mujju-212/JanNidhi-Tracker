import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

const states = ['Maharashtra', 'Uttar Pradesh', 'Bihar'];
const schemes = ['Ayushman Bharat', 'PM POSHAN', 'NHM'];

export default function MinReleaseFunds() {
  const [state, setState] = useState(states[0]);
  const [scheme, setScheme] = useState(schemes[0]);
  const [amount, setAmount] = useState('425');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release Funds to State">
        <div className="form-group">
          <label>Select Scheme</label>
          <select value={scheme} onChange={(event) => setScheme(event.target.value)}>
            {schemes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Select State</label>
          <select value={state} onChange={(event) => setState(event.target.value)}>
            {states.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Release Order (PDF)</label>
          <input type="file" />
        </div>
        <button className="btn">Release Funds</button>
      </Card>

      <Card title="Smart Contract Checks">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Amount within allocation: YES</div>
          <div>Scheme active: YES</div>
          <div>State wallet verified: YES</div>
          <div>Previous UC submitted: YES</div>
        </div>
      </Card>

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: Ministry Wallet</div>
          <div>To: {state} State Wallet</div>
          <div>Scheme: {scheme}</div>
          <div>Amount: Rs {amount} Cr</div>
        </div>
      </Card>
    </div>
  );
}
