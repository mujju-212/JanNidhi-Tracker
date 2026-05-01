import Card from '../../components/common/Card.jsx';

export default function DTReleaseFunds() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release Funds to Panchayat">
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>PM-KISAN</option>
            <option>PM POSHAN</option>
            <option>Ayushman Bharat</option>
          </select>
        </div>
        <div className="form-group">
          <label>Panchayat</label>
          <select>
            <option>Ambegaon</option>
            <option>Khed</option>
            <option>Junnar</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input placeholder="Enter release amount" />
        </div>
        <div className="form-group">
          <label>Release Reference</label>
          <input placeholder="REL-2024-PN-001" />
        </div>
        <button className="btn">Release Funds</button>
      </Card>

      <Card title="Pre-release Checks">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Verify UC status for previous installment.</div>
          <div>Confirm beneficiary enrollment count.</div>
          <div>Ensure panchayat wallet is active.</div>
        </div>
      </Card>
    </div>
  );
}
