import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: {
      bg: 'var(--primary-50)',
      border: 'var(--primary-200)',
      icon: 'var(--primary-600)',
      text: 'var(--primary-800)'
    },
    green: {
      bg: 'var(--accent-green-bg)',
      border: 'var(--accent-green-border)',
      icon: 'var(--accent-green)',
      text: '#065f46'
    },
    yellow: {
      bg: 'var(--accent-yellow-bg)',
      border: 'var(--accent-yellow-border)',
      icon: 'var(--accent-yellow)',
      text: '#92400e'
    },
    red: {
      bg: 'var(--accent-red-bg)',
      border: 'var(--accent-red-border)',
      icon: 'var(--accent-red)',
      text: '#991b1b'
    }
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="card" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--neutral-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '6px'
          }}>
            {title}
          </p>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--neutral-900)',
            lineHeight: 1.1,
            margin: '4px 0 8px'
          }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '0.825rem', color: 'var(--neutral-600)', margin: 0, fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: currentTheme.bg,
          border: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: currentTheme.icon
        }}>
          {Icon && <Icon size={24} />}
        </div>
      </div>

      {trend && (
        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--neutral-100)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: currentTheme.text
        }}>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
