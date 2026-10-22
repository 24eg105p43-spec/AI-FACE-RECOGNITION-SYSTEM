import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resetFacultyPassword } from '../utils/api';

export default function Login({ onSwitchToStudentDemo }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password reset fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const { login, register } = useAuth();

  // Email format validation
  const isValidEmail = (val) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(val.trim());
  };

  // Password strength score (0-4)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid, existing email address (e.g. name@college.edu or name@domain.com).');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setError('Please provide your full legal name.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter your password.');
          setLoading(false);
          return;
        }

        await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          department
        });
      } else {
        await login(cleanEmail, password);
      }
    } catch (err) {
      setError(err.message || (isRegisterMode ? 'Registration failed. Please check your credentials.' : 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!isValidEmail(resetEmail)) {
      setResetError('Please enter a valid email address.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('New password must be at least 8 characters long.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetFacultyPassword(resetEmail.trim(), resetNewPassword);
      setResetSuccess(res.message || 'Password successfully updated! You can now sign in.');
      setTimeout(() => {
        setIsResetModalOpen(false);
        setPassword('');
        setResetEmail('');
        setResetNewPassword('');
        setSuccessMsg('Password updated. Please log in with your new credentials.');
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. Verify your email is registered.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      background: 'linear-gradient(135deg, #090e17 0%, #0f1f3d 40%, #172554 80%, #1e3a8a 100%)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Background Light Orbs */}
      <div style={{
        position: 'absolute',
        width: 'min(600px, 90vw)',
        height: 'min(600px, 90vw)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
        top: '-150px',
        right: '-100px',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        width: 'min(500px, 80vw)',
        height: 'min(500px, 80vw)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        bottom: '-120px',
        left: '-100px',
        pointerEvents: 'none'
      }} />

      <div className="card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: 'clamp(24px, 5vw, 40px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 99, 235, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45)',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 800, color: 'var(--neutral-900)', margin: '0 0 6px' }}>
            {isRegisterMode ? 'Create Faculty Account' : 'Faculty & Admin Portal'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', margin: 0 }}>
            {isRegisterMode 
              ? 'Register with your existing institutional email' 
              : 'Sign in to access AI Face Biometrics & Attendance'}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: 'var(--neutral-100)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '9px',
              border: 'none',
              background: !isRegisterMode ? '#ffffff' : 'transparent',
              color: !isRegisterMode ? 'var(--primary-700)' : 'var(--neutral-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: !isRegisterMode ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '9px',
              border: 'none',
              background: isRegisterMode ? '#ffffff' : 'transparent',
              color: isRegisterMode ? 'var(--primary-700)' : 'var(--neutral-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: isRegisterMode ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            padding: '12px 14px',
            background: 'var(--accent-green-bg)',
            border: '1px solid var(--accent-green-border)',
            color: '#065f46',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={18} color="var(--accent-green)" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '12px 14px',
            background: 'var(--accent-red-bg)',
            border: '1px solid var(--accent-red-border)',
            color: 'var(--accent-red)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name (Registration only) */}
          {isRegisterMode && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '5px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.925rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Department (Registration only) */}
          {isRegisterMode && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '5px' }}>
                Academic Department
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.925rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Information Science">Information Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '5px' }}>
              Institutional / Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty.name@college.edu"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-300)',
                  fontSize: '0.925rem'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                Password
              </label>
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-600)',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-300)',
                  fontSize: '0.925rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--neutral-400)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength meter for registration */}
            {isRegisterMode && password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        borderRadius: '2px',
                        background: strengthScore >= step ? strengthColors[strengthScore] : 'var(--neutral-200)',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.725rem', color: strengthColors[strengthScore], fontWeight: 600 }}>
                  Strength: {strengthLabels[strengthScore]}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Registration only) */}
          {isRegisterMode && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '5px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--neutral-400)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.925rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? (
              isRegisterMode ? 'Creating Real Account...' : 'Authenticating...'
            ) : (
              isRegisterMode ? 'Register Faculty Account' : 'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Security Assurance Badge */}
        <div style={{
          marginTop: '20px',
          padding: '10px 14px',
          background: 'var(--neutral-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--neutral-200)',
          fontSize: '0.75rem',
          color: 'var(--neutral-600)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <span>
            Enterprise Security: Protected with Bcrypt Salt-10, JWT Authentication & Rate Limiting.
          </span>
        </div>

        {/* Switch to Student Scanner */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--neutral-200)',
          textAlign: 'center'
        }}>
          <button
            type="button"
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

      {/* Forgot Password Modal */}
      {isResetModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                  Reset Account Password
                </h4>
                <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--neutral-500)' }}>
                  Update password for your registered email
                </p>
              </div>
            </div>

            {resetSuccess && (
              <div style={{ padding: '10px', background: 'var(--accent-green-bg)', color: '#065f46', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '14px' }}>
                {resetSuccess}
              </div>
            )}

            {resetError && (
              <div style={{ padding: '10px', background: 'var(--accent-red-bg)', color: 'var(--accent-red)', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '14px' }}>
                {resetError}
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="faculty@college.edu"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                  New Secure Password
                </label>
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
