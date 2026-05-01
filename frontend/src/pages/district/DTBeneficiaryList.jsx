import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';

const beneficiaries = [
  {
    id: 'ben-001',
    name: 'Ramesh Kumar',
    aadhaar: 'XXXX XXXX 7823',
    scheme: 'PM-KISAN',
    bank: 'SBI',
    status: 'active'
  },
  {
    id: 'ben-002',
    name: 'Sita Devi',
    aadhaar: 'XXXX XXXX 9912',
    scheme: 'PM POSHAN',
    bank: 'PNB',
    status: 'suspended'
  }
];

export default function DTBeneficiaryList() {
  return (
    <Card title="Beneficiaries">
      <div className="form-group" style={{ maxWidth: '320px' }}>
        <label>Search</label>
        <input placeholder="Search by name or Aadhaar" />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Aadhaar</th>
            <th>Scheme</th>
            <th>Bank</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {beneficiaries.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.aadhaar}</td>
              <td>{item.scheme}</td>
              <td>{item.bank}</td>
              <td>{item.status}</td>
              <td>
                <Link className="btn secondary" to={`/district/beneficiaries/${item.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
