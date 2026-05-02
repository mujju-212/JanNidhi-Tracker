import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { apiGet } from '../../services/api.js';

const statusTone = (status) => (status === 'active' ? 'low' : 'medium');
const ETHERSCAN = 'https://sepolia.etherscan.io';

export default function SAMinistryDetail() {
  const { ministryId } = useParams();
  const [ministry, setMinistry] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chainMinistry, setChainMinistry] = useState(null);
  const [chainBalance, setChainBalance] = useState(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiGet(`/api/superadmin/ministry/${ministryId}`),
      apiGet('/api/superadmin/transactions')
    ])
      .then(([ministryResponse, txResponse]) => {
        if (!mounted) return;
        const m = ministryResponse?.data || null;
        setMinistry(m);
        setTransactions(txResponse?.data || []);
        setError('');
        // Now fetch from blockchain if wallet exists
        if (m?.walletAddress) {
          setChainLoading(true);
          Promise.all([
            apiGet(`/api/blockchain/ministry/${m.walletAddress}`).catch(() => null),
            apiGet(`/api/blockchain/balance/${m.walletAddress}`).catch(() => null)
          ]).then(([chainRes, balRes]) => {
            if (!mounted) return;
            setChainMinistry(chainRes?.data || null);
            setChainBalance(balRes?.data || null);
          }).finally(() => { if (mounted) setChainLoading(false); });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load ministry details.');
        setMinistry(null);
        setTransactions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [ministryId]);

  const ministryCode = ministry?.jurisdiction?.ministryCode;

  const snapshot = useMemo(() => {
    const allocated = transactions
      .filter((tx) => tx.status === 'confirmed' && tx.fromRole === 'super_admin' && tx.toCode === ministryCode)
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);
    const released = transactions
      .filter((tx) => tx.status === 'confirmed' && tx.fromCode === ministryCode && tx.fromRole === 'ministry_admin')
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);
    const utilized = transactions
      .filter((tx) => tx.status === 'confirmed' && tx.ministryCode === ministryCode && ['state_admin', 'district_admin'].includes(tx.fromRole))
      .reduce((sum, tx) => sum + Number(tx.amountCrore || 0), 0);
    return { allocated, released, utilized };
  }, [transactions, ministryCode]);

  const releases = useMemo(
    () => transactions
      .filter((tx) => tx.fromCode === ministryCode && tx.toRole === 'state_admin')
      .slice(0, 20)
      .map((tx) => ({
        id: tx.transactionId,
        state: tx.stateCode || tx.toCode || '-',
        amount: Number(tx.amountCrore || 0),
        status: tx.status,
        blockchainTxHash: tx.blockchainTxHash,
        blockNumber: tx.blockNumber,
        schemeId: tx.schemeId,
        schemeName: tx.schemeName,
        date: tx.createdAt
      })),
    [transactions, ministryCode]
  );

  const releaseProgress = ministry?.budgetCapCrore
    ? Math.min(100, Math.round((snapshot.released / ministry.budgetCapCrore) * 100))
    : 0;

  // Cross-check: compare MongoDB values vs blockchain values
  const dbAllocated = snapshot.allocated;
  const chainAllocated = chainMinistry?.allocatedCrore ?? null;
  const allocationMatch = chainAllocated !== null ? dbAllocated === chainAllocated : null;

  return (
    <div className="grid" style={{ gap: '20px' }}>
      {/* Ministry Profile (MongoDB) */}
      <Card
        title="Ministry Profile"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link className="btn secondary" to="/superadmin/transactions">View Transactions</Link>
            <Link className="btn" to="/superadmin/reports">Generate Report</Link>
          </div>
        }
      >
        {loading ? <div className="helper">Loading ministry profile...</div> : null}
        {error ? <div className="alert">{error}</div> : null}
        {!loading && !error && !ministry ? <div className="helper">Ministry not found.</div> : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div>
            <div className="helper">Ministry</div>
            <div style={{ fontWeight: 600 }}>{ministry?.jurisdiction?.ministry || '-'}</div>
          </div>
          <div>
            <div className="helper">Code</div>
            <div>{ministry?.jurisdiction?.ministryCode || '-'}</div>
          </div>
          <div>
            <div className="helper">Head of Department</div>
            <div>{ministry?.fullName || '-'}</div>
          </div>
          <div>
            <div className="helper">Wallet Address</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {ministry?.walletAddress ? (
                <a href={`${ETHERSCAN}/address/${ministry.walletAddress}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#0f4aa7', textDecoration: 'underline' }}>
                  {ministry.walletAddress}
                </a>
              ) : '-'}
            </div>
          </div>
          <div>
            <div className="helper">Contact</div>
            <div>{ministry?.email || '-'}</div>
            <div>{ministry?.phone || '-'}</div>
          </div>
          <div>
            <div className="helper">Status</div>
            <Badge tone={statusTone(ministry?.isActive ? 'active' : 'inactive')} label={ministry?.isActive ? 'ACTIVE' : 'INACTIVE'} />
          </div>
        </div>
      </Card>

      {/* ═══ BLOCKCHAIN VERIFIED DATA ═══ */}
      <Card title="🔗 Blockchain Verified Data (Read from Sepolia Smart Contract)">
        {chainLoading ? (
          <div className="helper">⏳ Reading from Sepolia blockchain...</div>
        ) : chainMinistry ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(22, 182, 164, 0.08)', borderRadius: '8px', border: '1px solid rgba(22, 182, 164, 0.2)' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: '#16b6a4' }}>✅ Ministry Found on Blockchain</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                <div><span className="helper">Name (on-chain):</span><br /><strong>{chainMinistry.name}</strong></div>
                <div><span className="helper">Code (on-chain):</span><br /><strong>{chainMinistry.code}</strong></div>
                <div><span className="helper">Budget Cap (on-chain):</span><br /><strong>₹{chainMinistry.budgetCapCrore} Cr</strong></div>
                <div><span className="helper">Allocated (on-chain):</span><br /><strong>₹{chainMinistry.allocatedCrore} Cr</strong></div>
                <div><span className="helper">Released (on-chain):</span><br /><strong>₹{chainMinistry.releasedCrore} Cr</strong></div>
                <div><span className="helper">Active (on-chain):</span><br /><strong>{chainMinistry.isActive ? '✅ Yes' : '❌ No'}</strong></div>
                <div><span className="helper">Registered:</span><br /><strong>{new Date(chainMinistry.createdAt * 1000).toLocaleString()}</strong></div>
                {chainBalance && (
                  <div><span className="helper">On-chain Balance:</span><br /><strong>₹{chainBalance.balance} Cr</strong></div>
                )}
              </div>
            </div>

            {/* Cross-verification badge */}
            <div style={{ padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
              background: allocationMatch === true ? 'rgba(22, 163, 74, 0.08)' : allocationMatch === false ? 'rgba(220, 38, 38, 0.08)' : 'rgba(100,100,100,0.05)',
              border: `1px solid ${allocationMatch === true ? 'rgba(22, 163, 74, 0.3)' : allocationMatch === false ? 'rgba(220, 38, 38, 0.3)' : 'rgba(100,100,100,0.2)'}` }}>
              {allocationMatch === true ? (
                <>
                  <span style={{ fontSize: '18px' }}>✅</span>
                  <div><strong style={{ color: '#16a34a' }}>CROSS-VERIFIED</strong>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>MongoDB ({dbAllocated} Cr) ↔ Blockchain ({chainAllocated} Cr) — MATCH</div>
                  </div>
                </>
              ) : allocationMatch === false ? (
                <>
                  <span style={{ fontSize: '18px' }}>🚨</span>
                  <div><strong style={{ color: '#dc2626' }}>MISMATCH DETECTED</strong>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>MongoDB ({dbAllocated} Cr) ≠ Blockchain ({chainAllocated} Cr) — POSSIBLE TAMPER</div>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '12px', opacity: 0.5 }}>Cross-verification pending...</div>
              )}
            </div>
          </div>
        ) : (
          <div className="helper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>⚠️</span> Ministry not found on blockchain, or blockchain is unavailable.
          </div>
        )}
      </Card>

      {/* Budget Snapshot (MongoDB) + Blockchain comparison */}
      <div className="grid two">
        <Card title="Budget Snapshot (from MongoDB)">
          <div className="helper" style={{ display: 'grid', gap: '8px' }}>
            <div>Budget Cap: ₹{Number(ministry?.budgetCapCrore || 0).toFixed(2)} Cr</div>
            <div>Allocated: ₹{snapshot.allocated.toFixed(2)} Cr</div>
            <div>Released: ₹{snapshot.released.toFixed(2)} Cr</div>
            <div>Utilized: ₹{snapshot.utilized.toFixed(2)} Cr</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="helper">Released vs Cap ({releaseProgress}%)</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${releaseProgress}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Budget Snapshot (from Blockchain)">
          {chainMinistry ? (
            <div className="helper" style={{ display: 'grid', gap: '8px' }}>
              <div>Budget Cap: ₹{chainMinistry.budgetCapCrore} Cr</div>
              <div>Allocated: ₹{chainMinistry.allocatedCrore} Cr</div>
              <div>Released: ₹{chainMinistry.releasedCrore} Cr</div>
              <div>On-chain Balance: ₹{chainBalance?.balance ?? '...'} Cr</div>
            </div>
          ) : (
            <div className="helper">⏳ Loading from blockchain...</div>
          )}
        </Card>
      </div>

      {/* Releases with blockchain hashes */}
      <Card title="Fund Releases (with Blockchain Proof)">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Release ID</th>
                <th>State</th>
                <th>Scheme</th>
                <th>Amount</th>
                <th>Blockchain TX</th>
                <th>Block #</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{r.id}</td>
                  <td>{r.state}</td>
                  <td style={{ fontSize: '12px' }}>{r.schemeName || r.schemeId || '-'}</td>
                  <td>₹{r.amount} Cr</td>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                    {r.blockchainTxHash && r.blockchainTxHash !== 'PENDING' ? (
                      <a href={`${ETHERSCAN}/tx/${r.blockchainTxHash}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0f4aa7', textDecoration: 'underline' }}>
                        {r.blockchainTxHash.slice(0, 12)}...
                      </a>
                    ) : (
                      <Badge tone="medium" label="PENDING" />
                    )}
                  </td>
                  <td>
                    {r.blockNumber ? (
                      <a href={`${ETHERSCAN}/block/${r.blockNumber}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0f4aa7', textDecoration: 'underline', fontSize: '12px' }}>
                        #{r.blockNumber}
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    <Badge tone={r.status === 'confirmed' ? 'low' : 'medium'} label={r.status?.toUpperCase()} />
                  </td>
                  <td style={{ fontSize: '11px' }}>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {!releases.length ? (
                <tr><td colSpan="8" className="helper">No release records found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
