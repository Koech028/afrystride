import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await adminApi.me();
        setAdmin(data);
      } catch {
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}