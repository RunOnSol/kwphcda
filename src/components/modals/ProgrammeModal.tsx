import React from 'react';

const programmes = [
  {
    id: 1,
    name: 'Expanded Programme on Immunization (EPI)',
    description: 'A comprehensive immunization program aimed at reducing morbidity and mortality from vaccine-preventable diseases.',
    details: [
      'Routine immunization services for children under 5',
      'Supplementary immunization activities',
      'Cold chain management',
      'Vaccine logistics and supply management',
    ],
    status: 'Ongoing',
    impact: 'Over 85% immunization coverage achieved across the state',
  },
  {
    id: 2,
    name: 'Maternal and Child Health Week',
    description: 'A bi-annual event aimed at delivering a package of high-impact maternal and child health interventions.',
    details: [
      'Vitamin A supplementation',
      'Deworming of children',
      'Growth monitoring and promotion',
      'Health education on key household practices',
      'Antenatal care services for pregnant women',
    ],
    status: 'Bi-annual (May and November)',
    impact: 'Reaches over 500,000 children and 100,000 pregnant women annually',
  },
  {
    id: 3,
    name: 'Integrated Community Case Management (iCCM)',
    description: 'A community-based approach to delivering life-saving interventions for common childhood illnesses.',
    details: [
      'Training of community health workers',
      'Treatment of malaria, pneumonia, and diarrhea',
      'Referral of severe cases to health facilities',
      'Community mobilization and health education',
    ],
    status: 'Ongoing',
    impact: 'Reduced under-5 mortality by 25% in implementing communities',
  },
  {
    id: 4,
    name: 'Family Planning and Reproductive Health Programme',
    description: 'A comprehensive program aimed at promoting family planning and reproductive health services.',
    details: [
      'Provision of modern contraceptive methods',
      'Counseling on family planning',
      'Integration with other reproductive health services',
      'Community mobilization and sensitization',
    ],
    status: 'Ongoing',
    impact: 'Increased contraceptive prevalence rate from 15% to 35%',
  },
  {
    id: 5,
    name: 'School Health Programme',
    description: 'A comprehensive program aimed at improving the health of school-aged children through school-based interventions.',
    details: [
      'School health education',
      'School-based deworming',
      'School feeding program',
      'School environmental sanitation',
      'School health services',
    ],
    status: 'Ongoing',
    impact: 'Reaches over 300,000 school children annually',
  },
  {
    id: 6,
    name: 'Community-Led Total Sanitation (CLTS)',
    description: 'An approach to promote improved sanitation practices in communities to eliminate open defecation.',
    details: [
      'Community mobilization and sensitization',
      'Triggering sessions to create demand for sanitation',
      'Support for construction of latrines',
      'Monitoring and certification of open defecation-free communities',
    ],
    status: 'Ongoing',
    impact: '200 communities certified as open defecation-free',
  },
];

const ProgrammeModal = () => {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          KWPHCDA implements various programs aimed at improving health outcomes across different population groups in Kwara State. These programs are designed to address specific health challenges and are implemented in collaboration with various partners.
        </p>
      </div>
      
      <div className="space-y-6">
        {programmes.map((programme) => (
          <div key={programme.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-green-50 p-4">
              <h3 className="font-semibold text-green-800 text-lg">{programme.name}</h3>
              <div className="flex items-center mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Status: {programme.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">{programme.description}</p>
              
              <div className="mb-4">
                <h4 className="font-medium text-green-700 mb-2">Key Components:</h4>
                <ul className="space-y-1">
                  {programme.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-green-50 p-3 rounded-md">
                <h4 className="font-medium text-green-700 mb-1">Impact:</h4>
                <p className="text-sm text-gray-700">{programme.impact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Our Implementation Approach</h3>
        <p className="mb-4">
          KWPHCDA adopts a collaborative and integrated approach to program implementation, working closely with various stakeholders including:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Government Partners</h4>
            <p className="text-sm text-gray-600">State Ministry of Health, Local Government Authorities, other relevant ministries and agencies</p>
          </div>
          <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Development Partners</h4>
            <p className="text-sm text-gray-600">WHO, UNICEF, USAID, World Bank, and other international organizations</p>
          </div>
          <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Community Stakeholders</h4>
            <p className="text-sm text-gray-600">Traditional leaders, religious leaders, community-based organizations, and community health committees</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Get Involved</h3>
        <p className="mb-6">
          Interested in supporting or participating in our programs? We welcome partnerships and collaborations from organizations and individuals committed to improving health outcomes in Kwara State.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300">
          Partner With Us
        </button>
      </div>
    </div>
  );
};

export default ProgrammeModal;