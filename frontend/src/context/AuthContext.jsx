import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  // Synchronize state with localStorage
  const setAuthSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    if (authToken) {
      localStorage.setItem('token', authToken);
    } else {
      localStorage.removeItem('token');
    }
    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  /**
   * Log in user using credentials via Spring Boot JWT backend.
   * Standard production flow: POST /api/v1/auth/login -> { token, role, ... }
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Standard Flow: Call Spring Boot JWT backend
      const res = await authApi.login({ email, password });
      const authData = res.data || res;
      const userData = {
        id: authData.id || authData.userId || authData.customerId,
        name: authData.name || authData.fullName,
        email: authData.email,
        role: authData.role || null,
        isCustomer: Boolean(authData.isCustomer || authData.role === 'CUSTOMER' || authData.customerId),
        customerType: authData.customerType || null,
      };

      setAuthSession(authData.token, userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new customer
   */
  const registerCustomer = async (customerData) => {
    setLoading(true);
    try {
      const res = await authApi.registerCustomer(customerData);
      return res.data || res;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out and clear session
   */
  const logout = useCallback(() => {
    setAuthSession(null, null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        role: user?.role || null, // ADMIN, MANAGER, STAFF
        isCustomer: !!user?.isCustomer,
        login,
        registerCustomer,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
