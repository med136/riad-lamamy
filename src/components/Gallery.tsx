"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3x3,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
} from "lucide-react";

const galleryImages = [
  { id: 1, category: "architecture", title: "Facade traditionnelle", featured: true },
  { id: 2, category: "chambres", title: "Suite royale - salon" },
  { id: 3, category: "jardin", title: "Piscine et jardin", featured: true },
  { id: 4, category: "restauration", title: "Restaurant aux chandelles" },
  { id: 5, category: "architecture", title: "Patio avec fontaine" },
  { id: 6, category: "chambres", title: "Chambre deluxe" },
  { id: 7, category: "spa", title: "Hammam traditionnel" },
  { id: 8, category: "jardin", title: "Terrasse panoramique", featured: true },
  { id: 9, category: "architecture", title: "Details zellige" },
  { id: 10, category: "restauration", title: "Petit-dejeuner marocain" },
  { id: 11, category: "spa", title: "Salle de massage" },
  { id: 12, category: "chambres", title: "Chambre standard" },
];

type GalleryProps = {
  selectedCategory: string;
};

export default function Gallery({ selectedCategory }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  const selectedImageIndex =
    selectedImage !== null
      ? filteredImages.findIndex((img) => img.id === selectedImage)
      : -1;

  const nextImage = () => {
    if (selectedImageIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[selectedImageIndex + 1].id);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImage(filteredImages[selectedImageIndex - 1].id);
    }
  };

  const toggleFavorite = (id: number | null) => {
    if (!id) return;
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const categoryTone = (category: string) => {
    switch (category) {
      case "architecture":
        return "from-amber-100 to-amber-200";
      case "chambres":
        return "from-slate-100 to-slate-200";
      case "jardin":
        return "from-emerald-100 to-emerald-200";
      case "restauration":
        return "from-rose-100 to-rose-200";
      default:
        return "from-purple-100 to-purple-200";
    }
  };

  useEffect(() => {
    if (!selectedImage) return;
    const exists = filteredImages.some((img) => img.id === selectedImage);
    if (!exists) setSelectedImage(null);
  }, [selectedCategory, selectedImage, filteredImages]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="lux-kicker text-amber-700/80 mb-2">GALERIE</div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Galerie complete
          </h2>
          <p className="text-gray-600">
            {filteredImages.length} photo
            {filteredImages.length > 1 ? "s" : ""} disponible
            {filteredImages.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-amber-700 hover:text-amber-800">
            <Download size={20} />
            <span className="font-semibold">Telecharger tout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <motion.div
            key={image.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative aspect-square rounded-3xl overflow-hidden cursor-pointer group shadow-lg ${
              image.featured ? "md:col-span-2 md:row-span-2" : ""
            }`}
            onClick={() => setSelectedImage(image.id)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${categoryTone(
                image.category
              )}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="lux-kicker text-slate-700/70 mb-3">
                    {image.category.toUpperCase()}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900">
                    {image.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]">
                      {image.category}
                    </div>
                    <h3 className="text-lg font-semibold">{image.title}</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(image.id);
                    }}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Heart
                      size={20}
                      className={
                        favorites.includes(image.id)
                          ? "fill-rose-500 text-rose-500"
                          : ""
                      }
                    />
                  </button>
                </div>
              </div>
            </div>

            {image.featured && (
              <div className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                COUP DE COEUR
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center items-center space-x-4 mt-12">
        <button className="px-4 py-2 bg-white/80 border border-amber-200/60 rounded-xl hover:border-amber-400 transition-colors">
          Precedent
        </button>
        <div className="flex space-x-2">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`w-10 h-10 rounded-xl ${
                page === 1
                  ? "bg-amber-700 text-white"
                  : "bg-white/80 border border-amber-200/60 hover:border-amber-400"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-white/80 border border-amber-200/60 rounded-xl hover:border-amber-400 transition-colors">
          Suivant
        </button>
      </div>

      <AnimatePresence>
        {selectedImage !== null && selectedImageIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-amber-400 z-10"
              >
                <X size={32} />
              </button>

              {selectedImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors text-white"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {selectedImageIndex < filteredImages.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors text-white"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              <div className="lux-panel rounded-3xl overflow-hidden">
                <div className="p-10">
                  <div className="text-center">
                    <div
                      className={`mx-auto w-28 h-28 rounded-full bg-gradient-to-br ${categoryTone(
                        filteredImages[selectedImageIndex]?.category || "architecture"
                      )} flex items-center justify-center mb-6`}
                    >
                      <Grid3x3 size={36} className="text-slate-700" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-2">
                      {filteredImages[selectedImageIndex]?.title}
                    </h3>
                    <div className="inline-flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-full mb-6 border border-amber-200/60">
                      <Grid3x3 size={18} />
                      <span className="font-semibold">
                        {filteredImages[selectedImageIndex]?.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      Cette photo montre un aspect caracteristique de notre riad.
                      La qualite reelle des images est bien superieure.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/60 p-6">
                  <div className="flex flex-wrap justify-center gap-6">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-amber-700">
                      <Download size={20} />
                      <span>Telecharger</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-amber-700">
                      <Share2 size={20} />
                      <span>Partager</span>
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedImage)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-amber-700"
                    >
                      <Heart
                        size={20}
                        className={
                          selectedImage && favorites.includes(selectedImage)
                            ? "fill-rose-500 text-rose-500"
                            : ""
                        }
                      />
                      <span>Favori</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center text-white mt-4">
                {selectedImageIndex + 1} / {filteredImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
