import React from "react";

import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AdminPanel from "./components/admin/AdminPanel";
import AuthPage from "./components/auth/AuthPage";
import SigninPage from "./components/auth/SigninPage";
import SignupPage from "./components/auth/SignupPage";
import BlogPost from "./components/blog/BlogPost";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailGeneration from "./components/staff/EmailGeneration";
import { AuthProvider } from "./context/AuthContext";

const AppContent: React.FC = () => {
  // const { user, loading } = useAuth();

  // // Show loading spinner during initial authentication check
  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/blog/:id" element={<BlogPost />} />
      <Route path="/staff/email" element={<EmailGeneration />} />

      {/* Protected routes */}
      <Route
        path="/dash"
        element={
          <ProtectedRoute requireApproval>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireApproval>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Legacy auth route - redirect to signin */}
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              style: {
                background: "#10B981",
              },
            },
            error: {
              style: {
                background: "#EF4444",
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
