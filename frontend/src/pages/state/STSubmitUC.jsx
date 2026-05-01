import Card from '../../components/common/Card.jsx';

export default function STSubmitUC() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Submit Utilization Certificate">
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>Ayushman Bharat</option>
            <option>PM POSHAN</option>
            <option>NHM</option>
          </select>
        </div>
        <div className="form-group">
          <label>Installment</label>
          <select>
            <option>Q1 2024</option>
            <option>Q2 2024</option>
            <option>Q3 2024</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount Utilized (Cr)</label>
          <input placeholder="Enter utilized amount" />
        </div>
        <div className="form-group">
          <label>Upload UC Document</label>
          <input type="file" />
        </div>
        <button className="btn">Submit UC</button>
      </Card>

      <Card title="Pending UCs">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Ayushman Bharat - Q4 2023 (15 days overdue)</div>
          <div>NHM - Q1 2024 (7 days overdue)</div>
        </div>
      </Card>
    </div>
  );
}
