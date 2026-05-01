import Card from '../../components/common/Card.jsx';

export default function SASystemSettings() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Security Controls" action={<button className="btn">Save Settings</button>}>
        <div className="form-group">
          <label>Session Timeout (minutes)</label>
          <input type="number" defaultValue="30" />
        </div>
        <div className="form-group">
          <label>Multi-Signature Approvals</label>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="checkbox" defaultChecked />
              Require 2 of 3 officer approvals for fund release
            </label>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="checkbox" defaultChecked />
              Lock transactions when anomaly score exceeds threshold
            </label>
          </div>
        </div>
      </Card>

      <Card title="Audit Rules">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div className="form-group">
            <label>Release Delay Threshold (days)</label>
            <input type="number" defaultValue="30" />
          </div>
          <div className="form-group">
            <label>Utilization Alert (%)</label>
            <input type="number" defaultValue="65" />
          </div>
          <div className="form-group">
            <label>Duplicate Beneficiary Limit</label>
            <input type="number" defaultValue="3" />
          </div>
        </div>
        <div className="helper">Alerts are auto-generated when thresholds are breached.</div>
      </Card>

      <Card title="Notifications & Escalations">
        <div className="form-group">
          <label>Escalate Critical Flags To</label>
          <select defaultValue="CAG Central">
            <option>CAG Central</option>
            <option>State Auditor</option>
            <option>MoF Monitoring Cell</option>
          </select>
        </div>
        <div className="form-group">
          <label>Daily Digest Time</label>
          <input defaultValue="09:00 AM" />
        </div>
        <div className="form-group">
          <label>Emergency Contact Email</label>
          <input defaultValue="monitoring@finmin.gov.in" />
        </div>
      </Card>
    </div>
  );
}
