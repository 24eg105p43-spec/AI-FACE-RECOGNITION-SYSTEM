import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bell, Clock, User, LogOut, QrCode, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSuspiciousAlerts } from '../utils/api';

export default function Navbar({ onOpenQRModal, onOpenAlerts, alertCount, onSwitchToStudentDemo }) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: '72px',
      background: '#ffffff',
      borderBottom: '1px solid var(--neutral-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand & System Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
        }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #1e3a8a, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            AI Attendance Dashboard
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', margin: 0, fontWeight: 500 }}>
            Smart Biometric Recognition & Timetable System
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--neutral-100)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--neutral-700)',
          border: '1px solid var(--neutral-200)'
        }}>
          <Clock size={15} color="var(--primary-600)" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{currentTime}</span>
        </div>

        {/* Switch to Student Scanner Demo Link */}
        <button
          onClick={onSwitchToStudentDemo}
          className="btn btn-secondary btn-sm"
          title="Open Student Scanner Interface"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ExternalLink size={15} />
          <span>Student Scanner View</span>
        </button>

        {/* Launch Attendance QR Button */}
        <button
          onClick={onOpenQRModal}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <QrCode size={16} />
          <span>Launch QR Session</span>
        </button>

        {/* Anti-Spoof Alert Bell */}
        <button
          onClick={onOpenAlerts}
          style={{
            position: 'relative',
            background: alertCount > 0 ? 'var(--accent-red-bg)' : 'var(--neutral-100)',
            border: `1px solid ${alertCount > 0 ? 'var(--accent-red-border)' : 'var(--neutral-200)'}`,
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: alertCount > 0 ? 'var(--accent-red)' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
          title={`${alertCount} Security Alerts`}
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-red)',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.7rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
            }}>
              {alertCount}
            </span>
          )}
        </button>

        {/* Faculty User Profile & Logout */}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--neutral-200)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--primary-100)',
              color: 'var(--primary-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {user?.name ? user.name.charAt(0) : 'P'}
            </div>
            <div style={{ display: 'none', md: 'block' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-900)' }}>
                {user?.name || 'Prof. Sharma'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--neutral-500)' }}>
                {user?.department || 'Computer Science'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--neutral-400)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}