import Card from '../../components/common/Card.jsx';

export default function STReleaseMatchingFund() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release State Matching Share">
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>Ayushman Bharat (CSS 60:40)</option>
            <option>NHM (CSS 60:40)</option>
            <option>PM POSHAN (Central 100%)</option>
          </select>
        </div>
        <div className="form-group">
          <label>State Share Amount (Cr)</label>
          <input placeholder="Enter matching amount" />
        </div>
        <div className="form-group">
          <label>UC Reference</label>
          <input placeholder="UC-2024-STATE-001" />
        </div>
        <div className="form-group">
          <label>Upload Matching Fund Proof</label>
          <input type="file" />
        </div>
        <button className="btn">Release Matching Share</button>
      </Card>

      <Card title="Smart Contract Checks">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Verify scheme is CSS and requires state contribution.</div>
          <div>Validate UC for previous installment.</div>
          <div>Confirm state treasury wallet is active.</div>
          <div>Check remaining state share limit for FY.</div>
        </div>
      </Card>
    </div>
  );
}
