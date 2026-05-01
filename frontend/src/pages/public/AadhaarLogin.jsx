import Card from '../../components/common/Card.jsx';

export default function AadhaarLogin() {
  return (
    <Card title="Citizen Login">
      <div className="form-group">
        <label>Aadhaar Number</label>
        <input placeholder="XXXX XXXX XXXX" />
      </div>
      <div className="form-group">
        <label>OTP</label>
        <input placeholder="Enter OTP" />
      </div>
      <button className="btn">Verify & Continue</button>
    </Card>
  );
}
