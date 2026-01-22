import React, { useEffect, useState } from 'react';
import { getAllPHCs, createPHC, updatePHC, deletePHC, uploadPHCImage, deletePHCImage } from '../../lib/supabase';
import { PHC, KWARA_LGAS } from '../../types';
import { Plus, Edit, Trash2, Search, Building2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PHCManagement: React.FC = () => {
  const [phcs, setPHCs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPHC, setEditingPHC] = useState<PHC | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lga: '',
    ward: '',
    address: '',
    phone: '',
    email: '',
    services: [] as string[],
    staff_count: 0,
    status: 'active' as 'active' | 'inactive',
    image_url: '',
  });

  const availableServices = [
    'Immunization',
    'Maternal Care',
    'Child Health',
    'Family Planning',
    'Laboratory Services',
    'Disease Control',
    'Health Education',
    'Nutrition Services',
    'Emergency Care',
    'Pharmacy Services',
  ];

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
      toast.error('Failed to fetch PHCs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        setUploadingImage(true);
        const { data: imageData, error: imageError } = await uploadPHCImage(imageFile);
        setUploadingImage(false);

        if (imageError) {
          toast.error('Failed to upload image');
          return;
        }

        imageUrl = imageData?.url || '';
      }

      const phcData = { ...formData, image_url: imageUrl };

      if (editingPHC) {
        const { error } = await updatePHC(editingPHC.id, phcData);
        if (error) throw error;

        setPHCs(phcs.map(phc =>
          phc.id === editingPHC.id ? { ...phc, ...phcData } : phc
        ));
        toast.success('PHC updated successfully');
      } else {
        const { data, error } = await createPHC(phcData);
        if (error) throw error;

        setPHCs([data, ...phcs]);
        toast.success('PHC created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving PHC:', error);
      toast.error('Failed to save PHC');
    }
  };

  const handleEdit = (phc: PHC) => {
    setEditingPHC(phc);
    setFormData({
      name: phc.name,
      lga: phc.lga,
      ward: phc.ward,
      address: phc.address,
      phone: phc.phone || '',
      email: phc.email || '',
      services: phc.services,
      staff_count: phc.staff_count,
      status: phc.status,
      image_url: phc.image_url || '',
    });
    setImagePreview(phc.image_url || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PHC?')) return;
    
    try {
      const { error } = await deletePHC(id);
      if (error) throw error;
      
      setPHCs(phcs.filter(phc => phc.id !== id));
      toast.success('PHC deleted successfully');
    } catch (error) {
      console.error('Error deleting PHC:', error);
      toast.error('Failed to delete PHC');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      lga: '',
      ward: '',
      address: '',
      phone: '',
      email: '',
      services: [],
      staff_count: 0,
      status: 'active',
      image_url: '',
    });
    setEditingPHC(null);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(false);
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const filteredPHCs = phcs.filter(phc =>
    phc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phc.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phc.ward.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search PHCs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add PHC
        </button>
      </div>

      {/* PHCs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPHCs.map((phc) => (
          <div key={phc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {phc.image_url && (
              <div className="h-40 overflow-hidden">
                <img
                  src={phc.image_url}
                  alt={phc.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {!phc.image_url && <Building2 className="h-8 w-8 text-green-600 mr-3" />}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{phc.name}</h3>
                    <p className="text-sm text-gray-500">{phc.lga}, {phc.ward}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  phc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {phc.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">{phc.address}</p>
                {phc.phone && (
                  <p className="text-sm text-gray-600">📞 {phc.phone}</p>
                )}
                {phc.email && (
                  <p className="text-sm text-gray-600">✉️ {phc.email}</p>
                )}
                <p className="text-sm text-gray-600">👥 {phc.staff_count} staff members</p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                <div className="flex flex-wrap gap-1">
                  {phc.services.slice(0, 3).map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                    >
                      {service}
                    </span>
                  ))}
                  {phc.services.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                      +{phc.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(phc)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(phc.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPHCs.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No PHCs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new PHC.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPHC ? 'Edit PHC' : 'Add New PHC'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PHC Image
                </label>
                <div className="flex items-start gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PHC Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LGA
                  </label>
                  <select
                    required
                    value={formData.lga}
                    onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select LGA</option>
                    {KWARA_LGAS.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ward
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ward}
                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.staff_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, staff_count: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableServices.map((service) => (
                    <label key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={uploadingImage}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    editingPHC ? 'Update PHC' : 'Create PHC'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PHCManagement;