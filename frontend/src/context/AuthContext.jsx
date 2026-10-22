import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginFaculty, getFacultyMe } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('faculty_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacultyProfile() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getFacultyMe();
        if (data && data.faculty) {
          setUser(data.faculty);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Failed to restore faculty session:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadFacultyProfile();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginFaculty(email, password);
    if (data && data.token) {
      localStorage.setItem('faculty_token', data.token);
      setToken(data.token);
      setUser(data.faculty);
      return data;
    }
    throw new Error('Authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('faculty_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
