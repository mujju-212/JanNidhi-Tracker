import Card from '../../components/common/Card.jsx';

const list = [
  { name: 'Ramesh Kumar', aadhaar: 'XXXX XXXX 7823', amount: '0.02', status: 'eligible' },
  { name: 'Sita Devi', aadhaar: 'XXXX XXXX 9912', amount: '0.02', status: 'held' }
];

export default function DTTriggerPayment() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Step 1: Select Scheme">
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>PM-KISAN</option>
            <option>PM POSHAN</option>
          </select>
        </div>
        <div className="form-group">
          <label>Installment</label>
          <select>
            <option>1</option>
            <option>2</option>
          </select>
        </div>
      </Card>

      <Card title="Step 2: Eligible Beneficiaries">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Aadhaar</th>
              <th>Amount (Cr)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.aadhaar}>
                <td>{item.name}</td>
                <td>{item.aadhaar}</td>
                <td>Rs {item.amount}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Step 3: Confirm Batch">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Total beneficiaries: 2</div>
          <div>Total amount: Rs 0.04 Cr</div>
          <div>Held: 1</div>
        </div>
        <button className="btn">Initiate Payment</button>
      </Card>
    </div>
  );
}
