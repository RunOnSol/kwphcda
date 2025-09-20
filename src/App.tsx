import React from 'react';

import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';

import AdminPanel from './components/admin/AdminPanel';
import AuthPage from './components/auth/AuthPage';
import BlogPost from './components/blog/BlogPost';
import BlogSection from './components/BlogSection';
import ExecutiveSection from './components/ExecutiveSection';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ModalContainer from './components/ModalContainer';
import Navbar from './components/Navbar';
import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If user is logged in and approved, show admin panel
  if (user && user.status === "approved") {
    return <AdminPanel />;
  }

  // If user is logged in but not approved, show admin panel (it will handle the pending state)
  if (user) {
    return <AdminPanel />;
  }

  // Public routes for non-authenticated users
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/blog/:id" element={<BlogPost />} />
      <Route
        path="/"
        element={
          <ModalProvider>
            <div className="min-h-screen bg-white flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Hero />
                <ExecutiveSection />
                <BlogSection />
              </main>
              <Footer />
              <ModalContainer />
            </div>
          </ModalProvider>
        }
      />
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
