import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

const districts = ['Pune', 'Nagpur', 'Nashik'];
const schemes = ['PM POSHAN', 'Ayushman Bharat', 'NHM'];

export default function STReleaseFunds() {
  const [district, setDistrict] = useState(districts[0]);
  const [scheme, setScheme] = useState(schemes[0]);
  const [amount, setAmount] = useState('45');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release Funds to District">
        <div className="form-group">
          <label>District</label>
          <select value={district} onChange={(event) => setDistrict(event.target.value)}>
            {districts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Scheme</label>
          <select value={scheme} onChange={(event) => setScheme(event.target.value)}>
            {schemes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Utilization Certificate (PDF)</label>
          <input type="file" />
        </div>
        <button className="btn">Release Funds</button>
      </Card>

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: State Wallet</div>
          <div>To: {district} District Wallet</div>
          <div>Scheme: {scheme}</div>
          <div>Amount: Rs {amount} Cr</div>
          <div>UC Hash: IPFS://Qm2x9f...</div>
        </div>
      </Card>
    </div>
  );
}
