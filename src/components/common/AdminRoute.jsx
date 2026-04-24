import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import DashboardLayout from '../layout/DashboardLayout';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, hasRole, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Wrap admin pages in the admin dashboard layout so the sidebar persists
  return (
    <DashboardLayout title="Admin" onLogout={logout}>
      {children}
    </DashboardLayout>
  );
};

export default AdminRoute;
