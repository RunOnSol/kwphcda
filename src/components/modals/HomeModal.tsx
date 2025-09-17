import React from 'react';

const HomeModal = () => {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h3 className="text-xl font-semibold text-green-700">Our Mission</h3>
        <p>
          To improve the health status of all residents of Kwara State through the provision of high-quality, accessible, and affordable primary healthcare services in a sustainable manner.
        </p>
        
        <h3 className="text-xl font-semibold text-green-700 mt-6">Our Vision</h3>
        <p>
          A state where all communities have access to comprehensive primary healthcare services, leading to improved health outcomes and overall well-being of the population.
        </p>
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Key Strategic Objectives</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-medium mr-2 flex-shrink-0">1</span>
            <span>Strengthen primary healthcare delivery systems across all local government areas</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-medium mr-2 flex-shrink-0">2</span>
            <span>Improve maternal, newborn, and child health outcomes through targeted interventions</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-medium mr-2 flex-shrink-0">3</span>
            <span>Enhance disease surveillance and response capabilities</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-medium mr-2 flex-shrink-0">4</span>
            <span>Strengthen health information systems for evidence-based decision making</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-medium mr-2 flex-shrink-0">5</span>
            <span>Increase community participation in health service delivery and utilization</span>
          </li>
        </ul>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Ongoing Programs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800">Immunization Plus Days</h4>
            <p className="text-sm text-gray-600">Statewide immunization campaign reaching over 500,000 children</p>
          </div>
          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800">Maternal Health Initiative</h4>
            <p className="text-sm text-gray-600">Comprehensive antenatal and postnatal care services</p>
          </div>
          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800">Community Health Workers Program</h4>
            <p className="text-sm text-gray-600">Training and deployment of community health workers</p>
          </div>
          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800">Health Education Campaign</h4>
            <p className="text-sm text-gray-600">Public health education on disease prevention and healthy habits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeModal;