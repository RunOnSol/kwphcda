import React from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireApproval = false,
}) => {
  const { user, loading } = useAuth();

  // Show loading spinner during authentication check
  if (loading) {
    return <LoadingSpinner />;
  }

  // If no user, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If approval is required and user is not approved, redirect to dashboard
  if (requireApproval && user.status !== "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
