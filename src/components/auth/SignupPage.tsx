import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import SignupForm from './SignupForm';

const SignupPage: React.FC = () => {
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user && user.status === "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleToggleForm = () => {
    window.location.href = "/signin";
  };

  return <SignupForm onToggleForm={handleToggleForm} />;
};

export default SignupPage;
