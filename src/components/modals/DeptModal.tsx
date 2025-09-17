import React from 'react';

const departments = [
  {
    id: 1,
    name: 'Maternal and Child Health',
    description: 'Focused on improving the health outcomes of mothers and children through comprehensive healthcare services and interventions.',
    functions: [
      'Implementation of maternal and child health programs',
      'Monitoring and evaluation of maternal health indicators',
      'Training of healthcare workers on maternal and child health services',
      'Coordination of antenatal and postnatal care services',
    ],
    icon: '👨‍👩‍👧',
  },
  {
    id: 2,
    name: 'Disease Control and Immunization',
    description: 'Responsible for the prevention, control, and management of communicable and non-communicable diseases through vaccination and other preventive measures.',
    functions: [
      'Planning and implementation of immunization campaigns',
      'Disease surveillance and outbreak response',
      'Cold chain management for vaccines',
      'Training on disease prevention and control',
    ],
    icon: '💉',
  },
  {
    id: 3,
    name: 'Health Planning, Research and Statistics',
    description: 'Responsible for data collection, analysis, and dissemination to inform evidence-based decision making in healthcare planning and delivery.',
    functions: [
      'Collection and analysis of health data',
      'Production of regular health statistics reports',
      'Coordination of health research activities',
      'Development of strategic health plans',
    ],
    icon: '📊',
  },
  {
    id: 4,
    name: 'Primary Health Care Services',
    description: 'Oversees the delivery of essential health services at the primary care level, ensuring accessibility, quality, and affordability.',
    functions: [
      'Supervision of primary healthcare facilities',
      'Quality assurance of healthcare services',
      'Implementation of health service delivery guidelines',
      'Coordination of health outreach activities',
    ],
    icon: '🏥',
  },
  {
    id: 5,
    name: 'Health Promotion and Education',
    description: 'Focuses on creating awareness and educating communities on health issues to promote healthy behaviors and preventive healthcare.',
    functions: [
      'Development of health education materials',
      'Community mobilization for health programs',
      'Implementation of behavior change communication strategies',
      'Training of community health workers on health promotion',
    ],
    icon: '📢',
  },
  {
    id: 6,
    name: 'Administration and Finance',
    description: 'Responsible for the administrative and financial management of the agency, ensuring efficient utilization of resources.',
    functions: [
      'Human resource management',
      'Financial planning and budgeting',
      'Procurement and supply chain management',
      'Asset management and logistics',
    ],
    icon: '💼',
  },
];

const DeptModal = () => {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          KWPHCDA operates through specialized departments, each focused on specific aspects of primary healthcare delivery. These departments work collaboratively to ensure comprehensive healthcare services across the state.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="border border-green-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-green-400">
            <div className="bg-green-50 p-4 flex items-center">
              <span className="text-3xl mr-3">{dept.icon}</span>
              <h3 className="font-semibold text-green-800">{dept.name}</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">{dept.description}</p>
              <h4 className="font-medium text-green-700 mb-2">Key Functions:</h4>
              <ul className="space-y-1">
                {dept.functions.map((func, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm">{func}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Department Collaboration</h3>
        <p className="mb-4">
          Our departments work together in an integrated approach to address health challenges in Kwara State. This collaborative framework ensures that all aspects of primary healthcare delivery are covered, from planning to implementation and evaluation.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {departments.map((dept) => (
            <span 
              key={dept.id} 
              className="px-4 py-2 bg-white border border-green-200 rounded-full text-green-700 text-sm font-medium"
            >
              {dept.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeptModal;