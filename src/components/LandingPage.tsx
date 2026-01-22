import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { ModalProvider } from '../context/ModalContext';
import BlogSection from './BlogSection';
import ExecutiveSection from './ExecutiveSection';
import Footer from './Footer';
import Hero from './Hero';
import ModalContainer from './ModalContainer';
import Navbar from './Navbar';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ModalProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <br />
          <br />
          <br />
     

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
