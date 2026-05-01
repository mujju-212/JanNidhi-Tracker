import { useState } from 'react';
import Card from '../../components/common/Card.jsx';

export default function VerifyTransaction() {
  const [hash, setHash] = useState('');

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Verify Transaction">
        <div className="form-group">
          <label>Transaction Hash or ID</label>
          <input
            placeholder="0xa3f9c2e8b4d7..."
            value={hash}
            onChange={(event) => setHash(event.target.value)}
          />
        </div>
        <button className="btn">Verify</button>
      </Card>

      <Card title="Verification Result">
        <div className="helper" style={{ display: 'grid', gap: '6px' }}>
          <div>Status: Verified</div>
          <div>Block Number: #48291</div>
          <div>From: Finance Ministry</div>
          <div>To: MoHFW</div>
          <div>Amount: Rs 22186 Cr</div>
        </div>
      </Card>
    </div>
  );
}
