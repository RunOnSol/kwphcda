import React, { useEffect, useState } from "react";

import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getPublicGalleryImages } from "../lib/supabase";
import { GalleryImage } from "../types";
import { ModalProvider } from "../context/ModalContext";
import Footer from "./Footer";
import ModalContainer from "./ModalContainer";
import Navbar from "./Navbar";

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadImages = async () => {
      try {
        const { data, error } = await getPublicGalleryImages();
        if (error) throw error;
        setImages((data as GalleryImage[]) || []);
      } catch (error) {
        console.error("Error loading gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  return (
    <ModalProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 px-4">
          <div className="container mx-auto">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center text-green-700 hover:text-green-800 font-medium mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>

            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-green-800">
                Photo Gallery
              </h1>
              <p className="text-gray-600 mt-3">
                Explore our events, outreach programs, and activities.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {image.title}
                      </h2>
                      {image.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No gallery images yet
                </h2>
                <p className="mt-1 text-gray-500">
                  Please check back later for updates.
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
        <ModalContainer />
      </div>
    </ModalProvider>
  );
};

export default GalleryPage;
