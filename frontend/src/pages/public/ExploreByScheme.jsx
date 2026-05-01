import Card from '../../components/common/Card.jsx';

const schemes = [
  { name: 'PM-KISAN', ministry: 'MoAgri', budget: '6000', progress: 78 },
  { name: 'PM POSHAN', ministry: 'MoEdu', budget: '7200', progress: 92 },
  { name: 'Ayushman Bharat', ministry: 'MoHFW', budget: '7000', progress: 85 }
];

export default function ExploreByScheme() {
  return (
    <Card title="Explore Schemes">
      <div className="form-group" style={{ maxWidth: '320px' }}>
        <label>Search Scheme</label>
        <input placeholder="Search by scheme name" />
      </div>
      <div className="grid stats">
        {schemes.map((scheme) => (
          <div key={scheme.name} className="card" style={{ padding: '16px' }}>
            <strong>{scheme.name}</strong>
            <div className="helper">Ministry: {scheme.ministry}</div>
            <div className="helper">Budget: Rs {scheme.budget} Cr</div>
            <div className="progress" style={{ marginTop: '10px' }}>
              <span style={{ width: `${scheme.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
