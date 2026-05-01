import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function STReleaseFunds() {
  const [districts, setDistricts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoadingMeta(true);
    Promise.all([apiGet('/api/state/district/all'), apiGet('/api/state/funds')])
      .then(([districtResponse, fundsResponse]) => {
        if (!mounted) return;
        const districtItems = districtResponse?.data || [];
        setDistricts(districtItems);
        setSelectedDistrict(districtItems[0]?.jurisdiction?.districtCode || '');

        const uniqueSchemes = [
          ...new Map(
            (fundsResponse?.data || [])
              .filter((item) => item.schemeId)
              .map((item) => [item.schemeId, { schemeId: item.schemeId, schemeName: item.schemeName || item.schemeId }])
          ).values()
        ];
        setSchemes(uniqueSchemes);
        setSelectedScheme(uniqueSchemes[0]?.schemeId || '');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load districts/schemes.');
      })
      .finally(() => {
        if (mounted) setLoadingMeta(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const district = useMemo(
    () => districts.find((item) => item.jurisdiction?.districtCode === selectedDistrict),
    [districts, selectedDistrict]
  );
  const scheme = useMemo(() => schemes.find((item) => item.schemeId === selectedScheme), [schemes, selectedScheme]);

  const release = async () => {
    if (!district || !scheme) {
      setError('Please select district and scheme.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPost('/api/state/funds/release', {
        districtCode: district.jurisdiction?.districtCode,
        districtWalletAddress: district.walletAddress,
        amountCrore: Number(amount || 0),
        schemeId: scheme.schemeId,
        schemeName: scheme.schemeName,
        ucDocHash: null
      });
      setSuccess('Funds released successfully.');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Unable to release funds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card title="Release Funds to District">
        <div className="form-group">
          <label>District</label>
          <select value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)} disabled={loadingMeta}>
            {districts.map((item) => (
              <option key={item._id} value={item.jurisdiction?.districtCode}>
                {item.jurisdiction?.district}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Scheme</label>
          <select value={selectedScheme} onChange={(event) => setSelectedScheme(event.target.value)} disabled={loadingMeta}>
            {schemes.map((item) => (
              <option key={item.schemeId} value={item.schemeId}>
                {item.schemeName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Utilization Certificate (PDF)</label>
          <input type="file" />
        </div>
        <button className="btn" type="button" onClick={release} disabled={loading || loadingMeta}>
          {loading ? 'Releasing...' : 'Release Funds'}
        </button>
        {error ? <div className="alert">{error}</div> : null}
        {success ? <div className="helper">{success}</div> : null}
      </Card>

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: State Wallet</div>
          <div>To: {district?.jurisdiction?.district || '-'} District Wallet</div>
          <div>Scheme: {scheme?.schemeName || '-'}</div>
          <div>Amount: Rs {amount} Cr</div>
          <div>UC Hash: IPFS://Qm2x9f...</div>
        </div>
      </Card>
    </div>
  );
}
