import Card from '../../components/common/Card.jsx';

export default function DTAddBeneficiary() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Step 1: Aadhaar Verification">
        <div className="form-group">
          <label>Aadhaar Number</label>
          <input placeholder="XXXX XXXX XXXX" />
        </div>
        <button className="btn secondary">Verify Aadhaar</button>
      </Card>

      <Card title="Step 2: Fetch Bank Details">
        <div className="helper">No manual entry allowed. Fetch via NPCI mapper.</div>
        <button className="btn secondary">Fetch Bank Details</button>
      </Card>

      <Card title="Step 3: Duplicate Check">
        <div className="helper">Check for existing enrollment in the same scheme.</div>
        <button className="btn secondary">Run Duplicate Check</button>
      </Card>

      <Card title="Step 4: Enrollment Summary">
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>PM-KISAN</option>
            <option>PM POSHAN</option>
          </select>
        </div>
        <div className="form-group">
          <label>Upload Proof Document (PDF)</label>
          <input type="file" />
        </div>
        <button className="btn">Enroll on Blockchain</button>
      </Card>
    </div>
  );
}
