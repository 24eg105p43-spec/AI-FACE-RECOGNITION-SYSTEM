import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bell, Clock, User, LogOut, QrCode, ExternalLink, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  onOpenQRModal, 
  onOpenAlerts, 
  alertCount, 
  onSwitchToStudentDemo,
  onToggleMobileSidebar 
}) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="navbar-header" style={{
      minHeight: '70px',
      background: '#ffffff',
      borderBottom: '1px solid var(--neutral-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(14px, 3vw, 32px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)',
      gap: '12px'
    }}>
      {/* Left: Mobile Menu Toggle & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger button for mobile */}
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-menu-btn"
          title="Open Navigation Menu"
          style={{
            background: 'var(--neutral-100)',
            border: '1px solid var(--neutral-200)',
            borderRadius: '10px',
            width: '38px',
            height: '38px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--neutral-700)'
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
          flexShrink: 0
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #1e3a8a, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            whiteSpace: 'nowrap'
          }}>
            AI Attendance
          </h1>
          <p className="navbar-subtitle" style={{ fontSize: '0.725rem', color: 'var(--neutral-500)', margin: 0, fontWeight: 500 }}>
            Biometrics & Timetable System
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 14px)', flexWrap: 'wrap' }}>
        {/* System Clock (visible on desktop/tablet) */}
        <div className="navbar-clock" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--neutral-100)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--neutral-700)',
          border: '1px solid var(--neutral-200)'
        }}>
          <Clock size={14} color="var(--primary-600)" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{currentTime}</span>
        </div>

        {/* Switch to Student Scanner Demo Link */}
        <button
          onClick={onSwitchToStudentDemo}
          className="btn btn-secondary btn-sm"
          title="Open Student Scanner Interface"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ExternalLink size={14} />
          <span className="navbar-scanner-text">Scanner View</span>
        </button>

        {/* Launch Attendance QR Button */}
        <button
          onClick={onOpenQRModal}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <QrCode size={15} />
          <span className="navbar-launch-text">Launch QR</span>
        </button>

        {/* Anti-Spoof Alert Bell */}
        <button
          onClick={onOpenAlerts}
          style={{
            position: 'relative',
            background: alertCount > 0 ? 'var(--accent-red-bg)' : 'var(--neutral-100)',
            border: `1px solid ${alertCount > 0 ? 'var(--accent-red-border)' : 'var(--neutral-200)'}`,
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: alertCount > 0 ? 'var(--accent-red)' : 'var(--neutral-600)',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          title={`${alertCount} Security Alerts`}
        >
          <Bell size={17} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-red)',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.65rem',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
            }}>
              {alertCount}
            </span>
          )}
        </button>

        {/* Real Faculty User Profile & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--neutral-200)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
              color: 'var(--primary-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '1px solid var(--primary-300)'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="navbar-user-info">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-900)', lineHeight: 1.2 }}>
                {user?.name || 'Faculty Member'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--neutral-500)', lineHeight: 1.2 }}>
                {user?.department || 'Academic Staff'}
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