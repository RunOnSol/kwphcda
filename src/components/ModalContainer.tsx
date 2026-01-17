import React from 'react';
import { useModal } from '../context/ModalContext';
import { X } from 'lucide-react';
import HomeModal from './modals/HomeModal';
import AboutModal from './modals/AboutModal';
import DeptModal from './modals/DeptModal';
import FacilitiesModal from './modals/FacilitiesModal';
import ServicesModal from './modals/ServicesModal';
import ContactModal from './modals/ContactModal';
import ProgrammeModal from './modals/ProgrammeModal';

const ModalContainer = () => {
  const { activeModal, closeModal } = useModal();

  if (!activeModal) return null;

  const renderModalContent = () => {
    switch (activeModal) {
      case 'home':
        return <HomeModal />;
      case 'about':
        return <AboutModal />;
      case 'dept':
        return <DeptModal />;
      case 'facilities':
        return <FacilitiesModal />;
      case 'services':
        return <ServicesModal />;
      case 'contact':
        return <ContactModal />;
      case 'programme':
        return <ProgrammeModal />;
      default:
        return <div>Modal content not found</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-green-800 capitalize">
            {activeModal === 'home' ? 'Welcome to KWSPHCDA' : activeModal}
          </h2>
          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;