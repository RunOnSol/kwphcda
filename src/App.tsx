import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ExecutiveSection from './components/ExecutiveSection';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';
import ModalContainer from './components/ModalContainer';
import { ModalProvider } from './context/ModalContext';

function App() {
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
}

export default App;