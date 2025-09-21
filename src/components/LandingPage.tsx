import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlogSection from './BlogSection';
import ExecutiveSection from './ExecutiveSection';
import Footer from './Footer';
import Hero from './Hero';
import ModalContainer from './ModalContainer';
import Navbar from './Navbar';
import { ModalProvider } from '../context/ModalContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, show the landing page with dashboard access
  React.useEffect(() => {
    // Don't redirect automatically, let users see the landing page
    // They can navigate to dashboard via the navbar
  }, [user, navigate]);

  return (
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
  );
};

export default LandingPage;