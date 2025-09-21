import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';

const SigninPage: React.FC = () => {
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user && user.status === "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleToggleForm = () => {
    window.location.href = "/signup";
  };

  return <LoginForm onToggleForm={handleToggleForm} />;
};

export default SigninPage;
