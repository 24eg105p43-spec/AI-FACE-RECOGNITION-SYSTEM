import React from 'react';
import { ShieldAlert, AlertTriangle, MapPin, X, CheckCircle, RefreshCw } from 'lucide-react';
import { clearSuspiciousAlerts } from '../utils/api';

export default function AntiSpoofAlerts({ alerts, onClose, onRefresh }) {
  const handleClear = async () => {
    try {
      await clearSuspiciousAlerts();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error clearing alerts: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '600px' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--neutral-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #991b1b, #ef4444)',
          color: '#ffffff',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={22} />
              <span>Biometric & GPS Security Alerts</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              Real-time anti-spoofing and campus boundary violation logs
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {(!alerts || alerts.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--neutral-500)' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--accent-green-bg)',
                color: 'var(--accent-green)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <CheckCircle size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--neutral-800)', margin: '0 0 6px' }}>
                All Systems Normal
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', margin: 0 }}>
                No active anti-spoof threats or GPS boundary violations recorded.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                  {alerts.length} Flagged Attempt(s)
                </span>
                <button
                  onClick={handleClear}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  Clear All Alerts
                </button>
              </div>

              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-red-bg)',
                    border: '1px solid var(--accent-red-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} color="var(--accent-red)" />
                      <strong style={{ fontSize: '0.9rem', color: '#991b1b' }}>
                        {alert.type === 'ANTI_SPOOF_TRIGGERED' ? 'Anti-Spoof Violation' : 'Campus Geofence Breach'}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                    {alert.message}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem', marginTop: '4px' }}>
                    <span className="badge badge-neutral">IP: {alert.clientIp || '127.0.0.1'}</span>
                    {alert.spoofScore !== undefined && (
                      <span className="badge badge-absent">
                        Spoof Probability: {(alert.spoofScore * 100).toFixed(1)}%
                      </span>
                    )}
                    {alert.reasons && alert.reasons.map((r, rIdx) => (
                      <span key={rIdx} className="badge badge-neutral" style={{ background: '#ffffff' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
