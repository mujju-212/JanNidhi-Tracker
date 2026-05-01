import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function DTBlockList() {
  const [taluks, setTaluks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/district/taluk/all')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        const mapped = items.map((item) => ({
          name: item.name,
          officer: item.officerName,
          wallet: item.walletAddress || '-',
          utilization: 0,
          status: item.status || 'active'
        }));
        setTaluks(mapped);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load taluks.');
        setTaluks([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card
      title="Taluk Accounts"
      action={
        <Link className="btn" to="/district/create-block">
          Create Taluk
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Block</th>
            <th>Officer</th>
            <th>Wallet</th>
            <th>Utilization</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="helper">
                Loading taluks...
              </td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="5" className="helper">
                {error}
              </td>
            </tr>
          ) : null}
          {taluks.map((taluk) => (
            <tr key={taluk.name}>
              <td>{taluk.name}</td>
              <td>{taluk.officer}</td>
              <td>{taluk.wallet}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${taluk.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(taluk.status)} label={taluk.status.toUpperCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
