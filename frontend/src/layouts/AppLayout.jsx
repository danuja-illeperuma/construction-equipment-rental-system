import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { CustomerLayout } from './CustomerLayout';

/**
 * Top-level application layout.
 * Intelligently switches between DashboardLayout (for Staff/Admin internal users)
 * and CustomerLayout (for Customers and public browsing).
 */
export const AppLayout = () => {
  const { user, isCustomer, role } = useAuth();

  // If user is authenticated and has an internal management role, show DashboardLayout
  if (user && !isCustomer && ['ADMIN', 'STAFF'].includes(role)) {
    return <DashboardLayout />;
  }

  // Otherwise (Customer or guest/public browsing), show CustomerLayout
  return <CustomerLayout />;
};

export default AppLayout;
