import { useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';

const ministries = [
  'Ministry of Health & Family Welfare',
  'Ministry of Education',
  'Ministry of Agriculture'
];

const fiscalYears = ['2024-25', '2025-26'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function SAAllocateBudget() {
  const [ministry, setMinistry] = useState(ministries[0]);
  const [year, setYear] = useState(fiscalYears[0]);
  const [quarter, setQuarter] = useState(quarters[0]);
  const [budgetType, setBudgetType] = useState('revenue');
  const [amount, setAmount] = useState('22186');
  const [rows, setRows] = useState([
    { id: 1, scheme: 'Ayushman Bharat', amount: '7200', type: 'CSS 60:40' },
    { id: 2, scheme: 'PM POSHAN', amount: '6000', type: 'Central 100%' }
  ]);
  const [billRef, setBillRef] = useState('AB-2024-XX');
  const [schedule, setSchedule] = useState('immediate');
  const [submitted, setSubmitted] = useState(false);

  const totalBreakdown = useMemo(() => {
    return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }, [rows]);

  const handleRowChange = (id, key, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  };

  const addRow = () => {
    const nextId = rows.length + 1;
    setRows((prev) => [...prev, { id: nextId, scheme: '', amount: '', type: '' }]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Allocate Budget to Ministry">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ministry</label>
            <select value={ministry} onChange={(event) => setMinistry(event.target.value)}>
              {ministries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Financial Year</label>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              {fiscalYears.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quarter</label>
            <select value={quarter} onChange={(event) => setQuarter(event.target.value)}>
              {quarters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Budget Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label>
                <input
                  type="radio"
                  checked={budgetType === 'revenue'}
                  onChange={() => setBudgetType('revenue')}
                />{' '}
                Revenue
              </label>
              <label>
                <input
                  type="radio"
                  checked={budgetType === 'capital'}
                  onChange={() => setBudgetType('capital')}
                />{' '}
                Capital
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Total Amount (Cr)</label>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Purpose Breakdown</label>
            <div style={{ display: 'grid', gap: '10px' }}>
              {rows.map((row) => (
                <div
                  key={row.id}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}
                >
                  <input
                    placeholder="Scheme name"
                    value={row.scheme}
                    onChange={(event) =>
                      handleRowChange(row.id, 'scheme', event.target.value)
                    }
                  />
                  <input
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(event) =>
                      handleRowChange(row.id, 'amount', event.target.value)
                    }
                  />
                  <input
                    placeholder="Type"
                    value={row.type}
                    onChange={(event) => handleRowChange(row.id, 'type', event.target.value)}
                  />
                </div>
              ))}
            </div>
            <button className="btn secondary" type="button" onClick={addRow}>
              Add Row
            </button>
            <div className="helper">Breakdown total: Rs {totalBreakdown} Cr</div>
          </div>

          <div className="form-group">
            <label>Appropriation Bill Reference</label>
            <input value={billRef} onChange={(event) => setBillRef(event.target.value)} />
          </div>

          <div className="form-group">
            <label>Release Schedule</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label>
                <input
                  type="radio"
                  checked={schedule === 'immediate'}
                  onChange={() => setSchedule('immediate')}
                />{' '}
                Immediate
              </label>
              <label>
                <input
                  type="radio"
                  checked={schedule === 'scheduled'}
                  onChange={() => setSchedule('scheduled')}
                />{' '}
                Scheduled
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn" type="submit">
              Confirm & Allocate on Blockchain
            </button>
            <button className="btn secondary" type="button">
              Save Draft
            </button>
          </div>
        </form>
      </Card>

      <Card title="Preview Block">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: Finance Ministry Wallet (0x1a2b...)</div>
          <div>To: {ministry} Wallet (0x4a9f...)</div>
          <div>Amount: Rs {amount} Cr</div>
          <div>Doc Hash: IPFS://Qm3x9f...</div>
          <div>Appropriation Bill: {billRef}</div>
        </div>
      </Card>

      {submitted ? (
        <Card title="Allocation Submitted">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>TX Hash: 0xa3f9c2e8b4d7...</div>
            <div>Block Number: #48291</div>
            <div>Ministry notified instantly.</div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
