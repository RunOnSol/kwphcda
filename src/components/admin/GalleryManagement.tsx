import React, { useEffect, useMemo, useRef, useState } from "react";

import { format } from "date-fns";
import { Calendar, Image as ImageIcon, Plus, Search, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { logActivity } from "../../lib/activityLogger";
import {
  createGalleryImage,
  deleteGalleryImageFile,
  deleteGalleryImageRecord,
  getAllGalleryImages,
  uploadGalleryImage,
} from "../../lib/supabase";
import { GalleryImage } from "../../types";

const ALLOWED_ROLES = ["super_admin", "admin", "manager", "blogger"];

const GalleryManagement: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active" as "active" | "archived",
  });

  const canManageGallery = ALLOWED_ROLES.includes(user?.role || "");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await getAllGalleryImages();
        if (error) throw error;
        setImages((data as GalleryImage[]) || []);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
        toast.error("Failed to load gallery images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const filteredImages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return images;

    return images.filter((image) => {
      return (
        image.title.toLowerCase().includes(term) ||
        (image.description || "").toLowerCase().includes(term)
      );
    });
  }, [images, searchTerm]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "active",
    });
    setImageFile(null);
    setImagePreview("");
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF and WebP images are allowed");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManageGallery) {
      toast.error("You do not have permission to upload gallery images");
      return;
    }
    if (!user?.id) {
      toast.error("Please sign in to continue");
      return;
    }
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const { data: uploadData, error: uploadError } = await uploadGalleryImage(imageFile);
      if (uploadError || !uploadData?.url || !uploadData.path) {
        throw uploadError || new Error("Failed to upload image");
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        image_url: uploadData.url,
        image_path: uploadData.path,
        author_id: user.id,
      };

      const { data, error } = await createGalleryImage(payload);
      if (error) {
        await deleteGalleryImageFile(uploadData.path);
        throw error;
      }

      setImages((prev) => [
        {
          ...(data as GalleryImage),
          author: { full_name: user.full_name, username: user.username },
        },
        ...prev,
      ]);

      toast.success("Gallery image uploaded successfully");
      logActivity("gallery_image_create", `Added gallery image: ${payload.title}`, {
        image_id: (data as GalleryImage).id,
        title: payload.title,
        status: payload.status,
      });
      resetForm();
    } catch (error) {
      console.error("Error creating gallery image:", error);
      toast.error("Failed to save gallery image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!canManageGallery) {
      toast.error("You do not have permission to delete gallery images");
      return;
    }
    if (!confirm(`Delete "${image.title}" from gallery?`)) return;

    try {
      await deleteGalleryImageFile(image.image_path);
      const { error } = await deleteGalleryImageRecord(image.id);
      if (error) throw error;

      setImages((prev) => prev.filter((item) => item.id !== image.id));
      toast.success("Gallery image deleted");
      logActivity("gallery_image_delete", `Deleted gallery image: ${image.title}`, {
        image_id: image.id,
        title: image.title,
      });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      toast.error("Failed to delete gallery image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {canManageGallery && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <img src={image.image_url} alt={image.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{image.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    image.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {image.status}
                </span>
              </div>

              {image.description && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{image.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {format(new Date(image.created_at), "MMM dd, yyyy")}
                </div>
                <span>By {image.author?.full_name || "Unknown"}</span>
              </div>

              {canManageGallery && (
                <button
                  onClick={() => handleDelete(image)}
                  className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-14 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">
            {searchTerm ? "No matching images found." : "No gallery images available yet."}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Gallery Image</h3>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "active" | "archived",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-56 w-auto object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (max 5MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Save Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
