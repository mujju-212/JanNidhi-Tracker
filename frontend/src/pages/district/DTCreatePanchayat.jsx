import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function DTCreatePanchayat() {
  const [panchayat, setPanchayat] = useState('Ambegaon');
  const [officer, setOfficer] = useState('Smt. Nita Deshmukh');
  const [email, setEmail] = useState('panchayat.ambegaon@gov.in');
  const [phone, setPhone] = useState('+91-98765-44444');

  const wallet = '0x8f2a...5511';

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Create Panchayat Account">
        <div className="form-group">
          <label>Panchayat Name</label>
          <input value={panchayat} onChange={(event) => setPanchayat(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Panchayat Officer</label>
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
        <button className="btn">Create Panchayat Account</button>
      </Card>

      <Card title="Permissions Summary">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Can enroll villagers and trigger payments.</div>
          <div>Can upload work proofs and submit UCs.</div>
        </div>
      </Card>
    </div>
  );
}
