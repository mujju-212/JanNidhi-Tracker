import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const beneficiaries = {
  'ben-001': {
    name: 'Ramesh Kumar',
    aadhaar: 'XXXX XXXX 7823',
    bank: 'SBI',
    ifsc: 'SBIN0001234',
    account: 'XXXXXX9012',
    status: 'active',
    schemes: [
      { name: 'PM-KISAN', amount: 2000, status: 'paid', lastPaid: '15 Apr 2024' },
      { name: 'Ayushman Bharat', amount: 500000, status: 'active', lastPaid: 'N/A' }
    ],
    payments: [
      { id: 'PAY-2024-011', amount: 2000, status: 'success', date: '15 Apr 2024' },
      { id: 'PAY-2024-008', amount: 2000, status: 'success', date: '12 Jan 2024' }
    ]
  }
};

const statusTone = (status) => (status === 'active' || status === 'paid' ? 'low' : 'medium');

export default function DTBeneficiaryDetail() {
  const { beneficiaryId } = useParams();
  const beneficiary = beneficiaries[beneficiaryId] || beneficiaries['ben-001'];

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Beneficiary Profile"
        action={
          <Link className="btn secondary" to="/district/beneficiaries">
            Back to List
          </Link>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div>
            <div className="helper">Name</div>
            <div style={{ fontWeight: 600 }}>{beneficiary.name}</div>
          </div>
          <div>
            <div className="helper">Aadhaar</div>
            <div>{beneficiary.aadhaar}</div>
          </div>
          <div>
            <div className="helper">Bank</div>
            <div>{beneficiary.bank}</div>
          </div>
          <div>
            <div className="helper">IFSC</div>
            <div>{beneficiary.ifsc}</div>
          </div>
          <div>
            <div className="helper">Account</div>
            <div>{beneficiary.account}</div>
          </div>
          <div>
            <div className="helper">Status</div>
            <Badge tone={statusTone(beneficiary.status)} label={beneficiary.status.toUpperCase()} />
          </div>
        </div>
      </Card>

      <Card title="Schemes Enrolled">
        <table className="table">
          <thead>
            <tr>
              <th>Scheme</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Last Paid</th>
            </tr>
          </thead>
          <tbody>
            {beneficiary.schemes.map((scheme) => (
              <tr key={scheme.name}>
                <td>{scheme.name}</td>
                <td>Rs {scheme.amount}</td>
                <td>
                  <Badge tone={statusTone(scheme.status)} label={scheme.status.toUpperCase()} />
                </td>
                <td>{scheme.lastPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Payment History">
        <table className="table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {beneficiary.payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>Rs {payment.amount}</td>
                <td>
                  <Badge tone={statusTone(payment.status)} label={payment.status.toUpperCase()} />
                </td>
                <td>{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
