// src/components/auth/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

// Hardcoded credentials (In production, never hardcode sensitive data)
const ADMIN_CREDENTIALS = {
  email: 'admin@dashboard.com',
  password: 'admin123'
};

// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize isAuthenticated from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  // Sync isAuthenticated with sessionStorage
  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated'); // Clear sessionStorage on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Protected Route Component
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};