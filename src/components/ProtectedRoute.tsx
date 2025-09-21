import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireApproval = false,
}) => {
  const { user, loading } = useAuth();

  // Show loading spinner only when actually loading and no user data
  if (loading && !user) {
    return <LoadingSpinner />;
  }

  // If no user, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If approval is required but user is not approved, still show the dashboard
  // (AdminPanel component will handle showing pending approval message)

  return <>{children}</>;
};

export default ProtectedRoute;
