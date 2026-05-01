import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function DTCreateBlock() {
  const [block, setBlock] = useState('Haveli');
  const [officer, setOfficer] = useState('Shri Suresh Kale');
  const [email, setEmail] = useState('block.haveli@gov.in');
  const [phone, setPhone] = useState('+91-98765-33333');

  const wallet = '0x3f9a...11c9';

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create Block Account">
        <div className="form-group">
          <label>Block Name</label>
          <input value={block} onChange={(event) => setBlock(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Block Officer</label>
          <input value={officer} onChange={(event) => setOfficer(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Official Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Official Phone</label>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Wallet Address (Auto-generated)</label>
          <input value={wallet} readOnly />
        </div>
        <button className="btn">Create Block Account</button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can manage panchayat accounts and verify payments.</div>
          <div>Can submit UCs for block-level releases.</div>
        </div>
      </Card>
    </div>
  );
}
