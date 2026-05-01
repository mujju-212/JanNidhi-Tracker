import Card from '../../components/common/Card.jsx';

export default function ExploreByLocation() {
  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Explore by Location">
        <div className="form-group">
          <label>State</label>
          <select>
            <option>Maharashtra</option>
            <option>Bihar</option>
          </select>
        </div>
        <div className="form-group">
          <label>District</label>
          <select>
            <option>Pune</option>
            <option>Nagpur</option>
          </select>
        </div>
        <div className="form-group">
          <label>Scheme</label>
          <select>
            <option>PM POSHAN</option>
            <option>PM-KISAN</option>
          </select>
        </div>
        <button className="btn">Search</button>
      </Card>

      <Card title="Pune District — PM POSHAN">
        <div className="helper" style={{ display: 'grid', gap: '6px' }}>
          <div>Allocated by Centre: Rs 50 Cr</div>
          <div>Released by State: Rs 48 Cr</div>
          <div>Received by District: Rs 45 Cr</div>
          <div>Reached Beneficiaries: Rs 40 Cr</div>
          <div>Unaccounted: Rs 5 Cr</div>
        </div>
      </Card>
    </div>
  );
}
