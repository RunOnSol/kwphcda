import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllPHCs } from '../../lib/supabase';
import { PHC } from '../../types';
import toast from 'react-hot-toast';

const FacilitiesModal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phcs, setPHCs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPHCs();
  }, []);

  const fetchPHCs = async () => {
    try {
      const { data, error } = await getAllPHCs();
      if (error) throw error;
      setPHCs(data || []);
    } catch (error) {
      console.error('Error fetching PHCs:', error);
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = phcs.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          KWSPHCDA manages a network of primary healthcare facilities across all 16 local government areas of Kwara State. These facilities serve as the first point of contact for healthcare services in their communities.
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
            {facility.image_url && (
              <div className="h-40 overflow-hidden">
                <img
                  src={facility.image_url}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!facility.image_url && (
              <div className="h-40 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg font-semibold">{facility.name.charAt(0)}</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-green-800 text-lg">{facility.name}</h3>
              <p className="text-gray-600 mb-3">{facility.lga}, {facility.ward}</p>

              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {facility.services.slice(0, 4).map((service, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {facility.services.length > 4 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">
                      +{facility.services.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Staff: {facility.staff_count}</span>
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
          KWSPHCDA has established a network of over 500 primary healthcare facilities across all 16 local government areas of Kwara State, ensuring that healthcare services are accessible to all residents, regardless of their location.
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