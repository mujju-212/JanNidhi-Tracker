import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { apiGet, apiPut } from '../../services/api.js';

export default function SASystemSettings() {
  const [form, setForm] = useState({
    sessionTimeoutMinutes: 30,
    multiSigApprovalsEnabled: true,
    autoLockOnAnomalyEnabled: true,
    releaseDelayThresholdDays: 30,
    utilizationAlertPercent: 65,
    duplicateBeneficiaryLimit: 3,
    escalateCriticalTo: 'CAG Central',
    digestTime: '09:00 AM',
    emergencyEmail: 'monitoring@finmin.gov.in'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/api/superadmin/settings')
      .then((response) => {
        if (!mounted) return;
        setForm((prev) => ({ ...prev, ...(response?.data || {}) }));
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Unable to load settings.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiPut('/api/superadmin/settings', form);
      setForm((prev) => ({ ...prev, ...(response?.data || {}) }));
      setSuccess('Settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="Security Controls"
        action={
          <button className="btn" onClick={saveSettings} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        }
      >
        {loading ? <div className="helper">Loading settings...</div> : null}
        {error ? <div className="alert">{error}</div> : null}
        {success ? <div className="helper">{success}</div> : null}
        <div className="form-group">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={form.sessionTimeoutMinutes}
            onChange={(event) => setField('sessionTimeoutMinutes', Number(event.target.value || 0))}
          />
        </div>
        <div className="form-group">
          <label>Multi-Signature Approvals</label>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={form.multiSigApprovalsEnabled}
                onChange={(event) => setField('multiSigApprovalsEnabled', event.target.checked)}
              />
              Require 2 of 3 officer approvals for fund release
            </label>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={form.autoLockOnAnomalyEnabled}
                onChange={(event) => setField('autoLockOnAnomalyEnabled', event.target.checked)}
              />
              Lock transactions when anomaly score exceeds threshold
            </label>
          </div>
        </div>
      </Card>

      <Card title="Audit Rules">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div className="form-group">
            <label>Release Delay Threshold (days)</label>
            <input
              type="number"
              value={form.releaseDelayThresholdDays}
              onChange={(event) => setField('releaseDelayThresholdDays', Number(event.target.value || 0))}
            />
          </div>
          <div className="form-group">
            <label>Utilization Alert (%)</label>
            <input
              type="number"
              value={form.utilizationAlertPercent}
              onChange={(event) => setField('utilizationAlertPercent', Number(event.target.value || 0))}
            />
          </div>
          <div className="form-group">
            <label>Duplicate Beneficiary Limit</label>
            <input
              type="number"
              value={form.duplicateBeneficiaryLimit}
              onChange={(event) => setField('duplicateBeneficiaryLimit', Number(event.target.value || 0))}
            />
          </div>
        </div>
        <div className="helper">Alerts are auto-generated when thresholds are breached.</div>
      </Card>

      <Card title="Notifications & Escalations">
        <div className="form-group">
          <label>Escalate Critical Flags To</label>
          <select
            value={form.escalateCriticalTo}
            onChange={(event) => setField('escalateCriticalTo', event.target.value)}
          >
            <option>CAG Central</option>
            <option>State Auditor</option>
            <option>MoF Monitoring Cell</option>
          </select>
        </div>
        <div className="form-group">
          <label>Daily Digest Time</label>
          <input value={form.digestTime} onChange={(event) => setField('digestTime', event.target.value)} />
        </div>
        <div className="form-group">
          <label>Emergency Contact Email</label>
          <input
            value={form.emergencyEmail}
            onChange={(event) => setField('emergencyEmail', event.target.value)}
          />
        </div>
      </Card>
    </div>
  );
}
