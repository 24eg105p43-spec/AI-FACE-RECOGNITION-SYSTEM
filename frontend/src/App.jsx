import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentScanner from './pages/StudentScanner';
import Login from './pages/Login';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [hasTokenParam, setHasTokenParam] = useState(
    new URLSearchParams(window.location.search).has('token')
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setHasTokenParam(new URLSearchParams(window.location.search).has('token'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Strict Restriction: If visiting /scan or scanning with QR token, ONLY show Student Scanner!
  const isStudentScannerRoute = currentPath === '/scan' || hasTokenParam;

  if (isStudentScannerRoute) {
    return <StudentScanner />;
  }

  // 2. Loading state for restoring faculty session
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        color: 'var(--neutral-600)',
        fontFamily: 'var(--font-sans)',
        gap: '12px'
      }}>
        <div className="pulse-dot" style={{ width: '16px', height: '16px' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading AI Attendance System...</span>
      </div>
    );
  }

  // 3. If faculty is not authenticated, show secure Login
  if (!isAuthenticated) {
    return (
      <Login
        onSwitchToStudentDemo={() => {
          window.history.pushState({}, '', '/scan');
          setCurrentPath('/scan');
        }}
      />
    );
  }

  // 4. Faculty/Admin Dashboard (Desktop & Tablet view)
  return (
    <FacultyDashboard
      onSwitchToStudentDemo={() => {
        window.history.pushState({}, '', '/scan');
        setCurrentPath('/scan');
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
