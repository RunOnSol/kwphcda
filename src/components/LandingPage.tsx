import React from "react";

import { ModalProvider } from "../context/ModalContext";
import BlogSection from "./BlogSection";
import ExecutiveSection from "./ExecutiveSection";
import FeaturesSection from "./FeaturesSection";
import Footer from "./Footer";
import LandingGallerySection from "./LandingGallerySection";
import Hero from "./Hero";
import ModalContainer from "./ModalContainer";
import Navbar from "./Navbar";

const LandingPage: React.FC = () => {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <br />
          <br />
          <br />

          <Hero />
          <FeaturesSection />
          <ExecutiveSection />
          <LandingGallerySection />
          <BlogSection />
        </main>
        <Footer />
        <ModalContainer />
      </div>
    </ModalProvider>
  );
};

export default LandingPage;
