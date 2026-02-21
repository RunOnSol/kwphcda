import React, { useEffect, useState } from "react";

import { Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getPublicGalleryImages } from "../lib/supabase";
import { GalleryImage } from "../types";

const LandingGallerySection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadImages = async () => {
      try {
        const { data, error } = await getPublicGalleryImages(6);
        if (error) throw error;
        setImages((data as GalleryImage[]) || []);
      } catch (error) {
        console.error("Error loading gallery preview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-green-800">Gallery</h2>
            <p className="text-gray-600 mt-2">
              Highlights from our events and activities.
            </p>
          </div>
          <button
            onClick={() => navigate("/gallery")}
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
          >
            View Full Gallery
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100"
              >
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-44 md:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="text-gray-500 mt-3">No gallery images yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingGallerySection;
