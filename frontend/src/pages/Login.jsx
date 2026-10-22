import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSwitchToStudentDemo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('prof.sharma@college.edu');
    setPassword('Password@123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #1e3a8a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Rings */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />

      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--neutral-900)', margin: '0 0 6px' }}>
            Faculty & Admin Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', margin: 0 }}>
            AI Face Recognition Attendance System
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--accent-red-bg)',
            border: '1px solid var(--accent-red-border)',
            color: 'var(--accent-red)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '6px' }}>
              Faculty College Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prof.sharma@college.edu"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-300)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '11px 14px 42px 42px',
                  paddingBottom: '11px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-300)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>

          {/* Quick Demo Credentials Fill Button */}
          <button
            type="button"
            onClick={handleQuickFill}
            style={{
              background: 'var(--primary-50)',
              border: '1px dashed var(--primary-300)',
              color: 'var(--primary-700)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} />
            <span>1-Click Demo Fill: Prof. Rajesh Sharma</span>
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--neutral-200)',
          textAlign: 'center'
        }}>
          <button
            onClick={onSwitchToStudentDemo}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--neutral-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Are you a student? Open Scanner Interface</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
