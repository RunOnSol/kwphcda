import React from 'react';

const services = [
  {
    id: 1,
    name: 'Immunization Services',
    description: 'Comprehensive immunization services for children and adults to prevent vaccine-preventable diseases.',
    details: [
      'Routine immunization for children under 5 years',
      'School-based immunization programs',
      'Supplementary immunization campaigns',
      'Cold chain management and vaccine logistics',
    ],
    icon: '💉',
  },
  {
    id: 2,
    name: 'Maternal and Child Health',
    description: 'Services aimed at improving the health outcomes of mothers and children through preventive and curative interventions.',
    details: [
      'Antenatal care services',
      'Skilled birth attendance',
      'Postnatal care services',
      'Growth monitoring and promotion',
      'Integrated management of childhood illnesses',
    ],
    icon: '👨‍👩‍👧',
  },
  {
    id: 3,
    name: 'Family Planning',
    description: 'Comprehensive family planning services to help individuals and couples make informed decisions about their reproductive health.',
    details: [
      'Counseling on family planning methods',
      'Provision of contraceptive methods',
      'Management of side effects',
      'Integration with other reproductive health services',
    ],
    icon: '👪',
  },
  {
    id: 4,
    name: 'Disease Control and Surveillance',
    description: 'Activities aimed at preventing and controlling communicable and non-communicable diseases through surveillance and response.',
    details: [
      'Disease surveillance and outbreak investigation',
      'Implementation of control measures',
      'Training of health workers on disease control',
      'Community mobilization for disease prevention',
    ],
    icon: '🔍',
  },
  {
    id: 5,
    name: 'Health Education and Promotion',
    description: 'Activities aimed at increasing knowledge and promoting behaviors that improve health outcomes in communities.',
    details: [
      'Community health education sessions',
      'Development and distribution of health education materials',
      'School health education programs',
      'Training of community health volunteers',
    ],
    icon: '📢',
  },
  {
    id: 6,
    name: 'Nutrition Services',
    description: 'Services aimed at improving the nutritional status of individuals, especially children and pregnant women.',
    details: [
      'Growth monitoring and promotion',
      'Management of malnutrition',
      'Micronutrient supplementation',
      'Nutrition education and counseling',
      'Community management of acute malnutrition',
    ],
    icon: '🍎',
  },
];

const ServicesModal = () => {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          KWSPHCDA provides a comprehensive range of primary healthcare services through its network of facilities across the state. These services are designed to address the basic health needs of communities and serve as the first point of contact with the healthcare system.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-50 p-4 flex items-center">
              <span className="text-3xl mr-3">{service.icon}</span>
              <h3 className="font-semibold text-green-800">{service.name}</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <h4 className="font-medium text-green-700 mb-2">Key Components:</h4>
              <ul className="space-y-1">
                {service.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-700 mb-4">Our Service Approach</h3>
        <p className="mb-4">
          KWSPHCDA adopts an integrated approach to service delivery, ensuring that all essential services are available at every primary healthcare facility. This comprehensive approach ensures that communities receive the full range of services they need without having to travel long distances.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Community-Based</h4>
            <p className="text-sm text-gray-600">Services are designed with input from communities to ensure they meet local needs and preferences.</p>
          </div>
          <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Integrated Delivery</h4>
            <p className="text-sm text-gray-600">Multiple services are integrated to ensure comprehensive care and efficient use of resources.</p>
          </div>
          <div className="bg-white p-4 rounded border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Quality-Focused</h4>
            <p className="text-sm text-gray-600">All services are delivered according to national standards and guidelines to ensure quality and safety.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-green-700 mb-4">How to Access Our Services</h3>
        <p className="mb-6">
          Our services are available at all primary healthcare facilities across the 16 local government areas of Kwara State. Simply visit your nearest facility during operating hours to access the services you need.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300">
          Find a Facility Near You
        </button>
      </div>
    </div>
  );
};

export default ServicesModal;