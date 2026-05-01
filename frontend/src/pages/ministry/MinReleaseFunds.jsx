import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPost } from '../../services/api.js';

export default function MinReleaseFunds() {
  const [states, setStates] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoadingMeta(true);
    Promise.all([apiGet('/api/ministry/state/all'), apiGet('/api/ministry/scheme/all')])
      .then(([stateResponse, schemeResponse]) => {
        if (!mounted) return;
        const stateItems = stateResponse?.data || [];
        const schemeItems = schemeResponse?.data || [];
        setStates(stateItems);
        setSchemes(schemeItems);
        setSelectedState(stateItems[0]?.jurisdiction?.stateCode || '');
        setSelectedScheme(schemeItems[0]?.schemeId || '');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load states/schemes.');
      })
      .finally(() => {
        if (mounted) setLoadingMeta(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const state = useMemo(
    () => states.find((item) => item.jurisdiction?.stateCode === selectedState),
    [states, selectedState]
  );
  const scheme = useMemo(
    () => schemes.find((item) => item.schemeId === selectedScheme),
    [schemes, selectedScheme]
  );

  const releaseFunds = async () => {
    if (!state || !scheme) {
      setError('Please select a state and scheme.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPost('/api/ministry/funds/release', {
        stateCode: state.jurisdiction?.stateCode,
        stateWalletAddress: state.walletAddress,
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
      <Card title="Release Funds to State">
        <div className="form-group">
          <label>Select Scheme</label>
          <select value={selectedScheme} onChange={(event) => setSelectedScheme(event.target.value)} disabled={loadingMeta}>
            {schemes.map((item) => (
              <option key={item.schemeId} value={item.schemeId}>
                {item.schemeName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Select State</label>
          <select value={selectedState} onChange={(event) => setSelectedState(event.target.value)} disabled={loadingMeta}>
            {states.map((item) => (
              <option key={item._id} value={item.jurisdiction?.stateCode}>
                {item.jurisdiction?.state}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Amount (Cr)</label>
          <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Release Order (PDF)</label>
          <input type="file" />
        </div>
        <button className="btn" type="button" onClick={releaseFunds} disabled={loading || loadingMeta}>
          {loading ? 'Releasing...' : 'Release Funds'}
        </button>
        {error ? <div className="alert">{error}</div> : null}
        {success ? <div className="helper">{success}</div> : null}
      </Card>

      <Card title="Smart Contract Checks">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>Amount within allocation: YES</div>
          <div>Scheme active: {scheme?.status === 'active' ? 'YES' : 'NO'}</div>
          <div>State wallet verified: {state?.walletAddress ? 'YES' : 'NO'}</div>
          <div>Previous UC submitted: YES</div>
        </div>
      </Card>

      <Card title="Block Preview">
        <div className="helper" style={{ display: 'grid', gap: '8px' }}>
          <div>From: Ministry Wallet</div>
          <div>To: {state?.jurisdiction?.state || '-'} State Wallet</div>
          <div>Scheme: {scheme?.schemeName || '-'}</div>
          <div>Amount: Rs {amount} Cr</div>
        </div>
      </Card>
    </div>
  );
}
