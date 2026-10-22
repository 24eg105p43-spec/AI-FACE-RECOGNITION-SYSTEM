import React from 'react';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';

export default function AttendanceChart({ stats }) {
  const { overview = {}, subjectStats = [] } = stats || {};
  const { present = 0, absent = 0, late = 0, total = 0, presentPct = 0, absentPct = 0, latePct = 0 } = overview;

  // Donut chart stroke calculation (circumference = 2 * PI * 40 = 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const validTotal = total > 0 ? total : 1;
  const presentStroke = (present / validTotal) * circumference;
  const lateStroke = (late / validTotal) * circumference;
  const absentStroke = (absent / validTotal) * circumference;

  const presentOffset = 0;
  const lateOffset = -presentStroke;
  const absentOffset = -(presentStroke + lateStroke);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* 1. Overall Attendance Donut Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--primary-600)" />
            <span>Attendance Breakdown</span>
          </h4>
          <span className="badge badge-primary">Total: {total} Logs</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="var(--neutral-100)"
                strokeWidth="12"
              />
              {/* Present Circle (Green) */}
              {present > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${presentStroke} ${circumference}`}
                  strokeDashoffset={presentOffset}
                  strokeLinecap="round"
                />
              )}
              {/* Late Circle (Yellow) */}
              {late > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${lateStroke} ${circumference}`}
                  strokeDashoffset={lateOffset}
                />
              )}
              {/* Absent Circle (Red) */}
              {absent > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${absentStroke} ${circumference}`}
                  strokeDashoffset={absentOffset}
                />
              )}
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                {presentPct}%
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
                PRESENT
              </span>
            </div>
          </div>

          {/* Legends */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#10b981' }} />
              <span style={{ color: 'var(--neutral-700)', fontWeight: 500, minWidth: '70px' }}>Present:</span>
              <strong style={{ color: 'var(--neutral-900)' }}>{present} ({presentPct}%)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#f59e0b' }} />
              <span style={{ color: 'var(--neutral-700)', fontWeight: 500, minWidth: '70px' }}>Late:</span>
              <strong style={{ color: 'var(--neutral-900)' }}>{late} ({latePct}%)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#ef4444' }} />
              <span style={{ color: 'var(--neutral-700)', fontWeight: 500, minWidth: '70px' }}>Absent:</span>
              <strong style={{ color: 'var(--neutral-900)' }}>{absent} ({absentPct}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subject-wise Attendance Rate Bar Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--primary-600)" />
            <span>Subject-Wise Attendance</span>
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontWeight: 500 }}>
            Real-Time Averages
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subjectStats.length === 0 ? (
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
              No subject logs recorded yet.
            </p>
          ) : (
            subjectStats.slice(0, 4).map((sub, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{sub.subject}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{sub.presentRate}%</span>
                </div>
                {/* Progress track */}
                <div style={{
                  height: '8px',
                  background: 'var(--neutral-100)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, sub.presentRate))}%`,
                    height: '100%',
                    background: sub.presentRate >= 75 ? 'linear-gradient(90deg, #10b981, #059669)' : sub.presentRate >= 60 ? '#f59e0b' : '#ef4444',
                    borderRadius: '999px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
