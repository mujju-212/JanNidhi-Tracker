import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const schemeData = {
  'ab-2024': {
    id: 'SCH-AB-2024',
    name: 'Ayushman Bharat',
    type: 'CSS 60:40',
    budget: 7200,
    released: 5600,
    utilized: 3820,
    status: 'active',
    rules: ['Aadhaar verified', 'Income below threshold', 'Hospital empanelled'],
    states: [
      { state: 'Uttar Pradesh', released: 1100, utilized: 720, status: 'on-track' },
      { state: 'Maharashtra', released: 900, utilized: 640, status: 'on-track' },
      { state: 'Bihar', released: 600, utilized: 280, status: 'watch' }
    ]
  },
  'poshan-2024': {
    id: 'SCH-POSHAN-2024',
    name: 'PM POSHAN',
    type: 'Central 100%',
    budget: 6000,
    released: 4200,
    utilized: 3250,
    status: 'active',
    rules: ['School enrollment mandatory', 'Nutrition committee approval'],
    states: [
      { state: 'Rajasthan', released: 800, utilized: 610, status: 'on-track' },
      { state: 'Tamil Nadu', released: 650, utilized: 520, status: 'on-track' }
    ]
  },
  'nhm-2024': {
    id: 'SCH-NHM-2024',
    name: 'NHM',
    type: 'CSS 60:40',
    budget: 5000,
    released: 3500,
    utilized: 2190,
    status: 'paused',
    rules: ['UC pending for last quarter', 'Facility audit required'],
    states: [
      { state: 'Assam', released: 420, utilized: 190, status: 'watch' }
    ]
  }
};

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');
const progress = (value, total) => Math.round((value / total) * 100);

export default function MinSchemeDetail() {
  const { schemeId } = useParams();
  const scheme = schemeData[schemeId] || schemeData['ab-2024'];
  const releaseProgress = progress(scheme.released, scheme.budget);
  const utilizationProgress = progress(scheme.utilized, scheme.released);

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Scheme Overview"
        action={
          <Link className="btn secondary" to="/ministry/schemes">
            Back to Schemes
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
            <div className="helper">Scheme</div>
            <div style={{ fontWeight: 600 }}>{scheme.name}</div>
          </div>
          <div>
            <div className="helper">Scheme ID</div>
            <div>{scheme.id}</div>
          </div>
          <div>
            <div className="helper">Type</div>
            <div>{scheme.type}</div>
          </div>
          <div>
            <div className="helper">Status</div>
            <Badge tone={statusTone(scheme.status)} label={scheme.status.toUpperCase()} />
          </div>
        </div>
      </Card>

      <div className="grid two">
        <Card title="Budget Snapshot">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Budget: Rs {scheme.budget} Cr</div>
            <div>Released: Rs {scheme.released} Cr</div>
            <div>Utilized: Rs {scheme.utilized} Cr</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Released ({releaseProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${releaseProgress}%` }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Utilized ({utilizationProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${utilizationProgress}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Eligibility Rules">
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px' }}>
            {scheme.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="State-wise Releases">
        <table className="table">
          <thead>
            <tr>
              <th>State</th>
              <th>Released (Cr)</th>
              <th>Utilized (Cr)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scheme.states.map((state) => (
              <tr key={state.state}>
                <td>{state.state}</td>
                <td>Rs {state.released}</td>
                <td>Rs {state.utilized}</td>
                <td>
                  <Badge
                    tone={state.status === 'on-track' ? 'low' : 'medium'}
                    label={state.status.replace('-', ' ').toUpperCase()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
