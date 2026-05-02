import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet } from '../../services/api.js';

export default function ExploreByLocation() {
  const [fundFlow, setFundFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/public/fund-flow')
      .then((res) => setFundFlow(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading fund flow data...</div>;

  return (
    <Card title="National Fund Flow Snapshot">
      <div className="grid stats">
        <div className="stat-card">
          <div className="stat-meta">
            <span>Centre to Ministries</span>
            <strong>Rs {Number(fundFlow?.allocated || 0).toFixed(2)} Cr</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-meta">
            <span>Ministries to States</span>
            <strong>Rs {Number(fundFlow?.toStates || 0).toFixed(2)} Cr</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-meta">
            <span>States to Districts</span>
            <strong>Rs {Number(fundFlow?.toDistricts || 0).toFixed(2)} Cr</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-meta">
            <span>Districts to Citizens</span>
            <strong>Rs {Number(fundFlow?.toBeneficiary || 0).toFixed(2)} Cr</strong>
          </div>
        </div>
      </div>

      <div className="stat-card" style={{ marginTop: '16px' }}>
        <div className="stat-meta">
          <span>Unaccounted Gap</span>
          <strong>Rs {Number(fundFlow?.unaccounted || 0).toFixed(2)} Cr</strong>
          <span>Leakage estimate: {fundFlow?.leakagePercent || 0}%</span>
        </div>
      </div>
    </Card>
  );
}
