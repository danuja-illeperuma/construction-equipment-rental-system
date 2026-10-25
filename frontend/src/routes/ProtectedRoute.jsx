import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, isCustomer } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const hasRole =
      (role && allowedRoles.includes(role)) ||
      (isCustomer && allowedRoles.includes('CUSTOMER'));

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
