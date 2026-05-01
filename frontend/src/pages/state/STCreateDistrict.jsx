import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function STCreateDistrict() {
  const [district, setDistrict] = useState('Pune');
  const [collector, setCollector] = useState('Shri Rajesh Patil');
  const [email, setEmail] = useState('collector.pune@gov.in');
  const [phone, setPhone] = useState('+91-98765-22222');

  const wallet = '0x7b9a...4421';

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create District Admin Account">
        <div className="form-group">
          <label>District</label>
          <input value={district} onChange={(event) => setDistrict(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Collector Name</label>
          <input value={collector} onChange={(event) => setCollector(event.target.value)} />
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
        <button className="btn">Create District Account</button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can enroll beneficiaries and trigger payments.</div>
          <div>Can release funds to panchayats and blocks.</div>
          <div>Must submit UCs for each installment.</div>
        </div>
      </Card>
    </div>
  );
}
