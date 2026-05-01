import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');

export default function DTPanchayatList() {
  const [panchayats, setPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/district/panchayat/all')
      .then((response) => {
        if (!mounted) return;
        const items = response?.data || [];
        const mapped = items.map((item) => ({
          name: item.name,
          taluk: item.talukName || '-',
          officer: item.officerName,
          wallet: item.walletAddress || '-',
          utilization: 0,
          status: item.status || 'active'
        }));
        setPanchayats(mapped);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load panchayats.');
        setPanchayats([]);
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
      title="Panchayat Accounts"
      action={
        <Link className="btn" to="/district/create-panchayat">
          Create Panchayat
        </Link>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Panchayat</th>
            <th>Taluk</th>
            <th>Officer</th>
            <th>Wallet</th>
            <th>Utilization</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="helper">
                Loading panchayats...
              </td>
            </tr>
          ) : null}
          {error ? (
            <tr>
              <td colSpan="6" className="helper">
                {error}
              </td>
            </tr>
          ) : null}
          {panchayats.map((panchayat) => (
            <tr key={panchayat.name}>
              <td>{panchayat.name}</td>
              <td>{panchayat.taluk}</td>
              <td>{panchayat.officer}</td>
              <td>{panchayat.wallet}</td>
              <td>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${panchayat.utilization}%` }}
                  />
                </div>
              </td>
              <td>
                <Badge tone={statusTone(panchayat.status)} label={panchayat.status.toUpperCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
