import Card from '../../components/common/Card.jsx';

export default function DTBulkEnroll() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Bulk Enroll Beneficiaries">
        <div className="form-group">
          <label>Upload CSV File</label>
          <input type="file" />
        </div>
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>PM-KISAN</option>
            <option>PM POSHAN</option>
            <option>Ayushman Bharat</option>
          </select>
        </div>
        <button className="btn">Validate & Enroll</button>
      </Card>

      <Card title="CSV Requirements">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Required columns: name, aadhaar, bank_ifsc, account_number, mobile.</div>
          <div>Only .csv files are accepted. Max 5,000 rows per batch.</div>
          <div>Duplicate Aadhaar will be flagged automatically.</div>
        </div>
      </Card>
    </div>
  );
}
