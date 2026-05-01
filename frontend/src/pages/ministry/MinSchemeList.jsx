import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';

const schemes = [
  { id: 'ab-2024', name: 'Ayushman Bharat', type: 'CSS 60:40', budget: '7200', progress: 85 },
  { id: 'poshan-2024', name: 'PM POSHAN', type: 'Central 100%', budget: '6000', progress: 97 },
  { id: 'nhm-2024', name: 'NHM', type: 'CSS 60:40', budget: '5000', progress: 90 }
];

export default function MinSchemeList() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Active Schemes">
        <div className="grid stats">
          {schemes.map((scheme) => (
            <div key={scheme.name} className="card" style={{ padding: '16px' }}>
              <strong>{scheme.name}</strong>
              <div className="helper">Type: {scheme.type}</div>
              <div className="helper">Budget: Rs {scheme.budget} Cr</div>
              <div className="progress" style={{ marginTop: '10px' }}>
                <span style={{ width: `${scheme.progress}%` }} />
              </div>
              <Link className="btn secondary" style={{ marginTop: '12px' }} to={`/ministry/scheme/${scheme.id}`}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
