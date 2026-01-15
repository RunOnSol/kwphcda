import React, { useState } from 'react';
import { Search } from 'lucide-react';

const facilities = [
  {
    id: 1,
    name: 'Ilorin Central PHC',
    location: 'Ilorin East LGA',
    services: ['Immunization', 'Maternal Care', 'Child Health', 'Family Planning'],
    staffCount: 15,
    imageUrl: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg',
  },
  {
    id: 2,
    name: 'Offa Township PHC',
    location: 'Offa LGA',
    services: ['Immunization', 'Maternal Care', 'Child Health', 'Laboratory Services'],
    staffCount: 12,
    imageUrl: 'https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg',
  },
  {
    id: 3,
    name: 'Lafiagi Community PHC',
    location: 'Edu LGA',
    services: ['Immunization', 'Maternal Care', 'Disease Control', 'Nutrition'],
    staffCount: 10,
    imageUrl: 'https://images.pexels.com/photos/127873/pexels-photo-127873.jpeg',
  },
  {
    id: 4,
    name: 'Omu-Aran Health Center',
    location: 'Irepodun LGA',
    services: ['Immunization', 'Maternal Care', 'Child Health', 'Health Education'],
    staffCount: 14,
    imageUrl: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg',
  },
  {
    id: 5,
    name: 'Patigi PHC',
    location: 'Patigi LGA',
    services: ['Immunization', 'Maternal Care', 'Family Planning', 'Disease Control'],
    staffCount: 11,
    imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
  },
  {
    id: 6,
    name: 'Kaiama Health Center',
    location: 'Kaiama LGA',
    services: ['Immunization', 'Maternal Care', 'Child Health', 'Nutrition'],
    staffCount: 9,
    imageUrl: 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg',
  },
];

const FacilitiesModal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFacilities = facilities.filter(facility => 
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          KWPHCDA manages a network of primary healthcare facilities across all 16 local government areas of Kwara State. These facilities serve as the first point of contact for healthcare services in their communities.
        </p>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          placeholder="Search facilities by name, location, or services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-40 overflow-hidden">
              <img 
                src={facility.imageUrl} 
                alt={facility.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-green-800 text-lg">{facility.name}</h3>
              <p className="text-gray-600 mb-3">{facility.location}</p>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {facility.services.map((service, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Staff: {facility.staffCount}</span>
                <button className="text-green-600 hover:text-green-800 font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredFacilities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No facilities found matching your search criteria.</p>
        </div>
      )}
      
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-700 mb-4">PHC Facility Distribution</h3>
        <p className="mb-4">
          KWPHCDA has established a network of over 500 primary healthcare facilities across all 16 local government areas of Kwara State, ensuring that healthcare services are accessible to all residents, regardless of their location.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded border border-green-100 text-center">
            <span className="block text-2xl font-bold text-green-700">16</span>
            <span className="text-sm text-gray-600">Local Government Areas</span>
          </div>
          <div className="bg-white p-3 rounded border border-green-100 text-center">
            <span className="block text-2xl font-bold text-green-700">500+</span>
            <span className="text-sm text-gray-600">PHC Facilities</span>
          </div>
          <div className="bg-white p-3 rounded border border-green-100 text-center">
            <span className="block text-2xl font-bold text-green-700">1,200+</span>
            <span className="text-sm text-gray-600">Healthcare Workers</span>
          </div>
          <div className="bg-white p-3 rounded border border-green-100 text-center">
            <span className="block text-2xl font-bold text-green-700">3M+</span>
            <span className="text-sm text-gray-600">Population Served</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesModal;