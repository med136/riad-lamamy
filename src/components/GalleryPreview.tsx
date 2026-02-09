"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Maximize2 } from "lucide-react";

type GalleryItem = {
  id: string | number;
  title: string;
  category: string;
  description?: string | null;
  image_url?: string | null;
  featured?: boolean;
};

const fallbackImages: GalleryItem[] = [
  {
    id: 1,
    title: "Cour interieure",
    category: "architecture",
    description: "Notre patio avec fontaine traditionnelle",
  },
  {
    id: 2,
    title: "Suite royale",
    category: "chambres",
    description: "Suite avec decoration marocaine authentique",
  },
  {
    id: 3,
    title: "Restaurant",
    category: "restauration",
    description: "Cuisine traditionnelle servie chaque soir",
  },
  {
    id: 4,
    title: "Jardin et piscine",
    category: "jardin",
    description: "Oasis de tranquillite au coeur du riad",
  },
];

export function GalleryPreview() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch("/api/gallery?limit=12", { cache: "no-store", signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const next = Array.isArray(data?.items) ? (data.items as GalleryItem[]) : [];
        if (next.length) setItems(next);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const sourceImages = items.length ? items : fallbackImages;

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(sourceImages.map((img) => img.category).filter(Boolean)));
    const labelFor = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    return [{ id: "all", name: "Toutes" }, ...uniq.map((id) => ({ id, name: labelFor(id) }))];
  }, [sourceImages]);

  const filteredImages = useMemo(() => {
    const next =
      activeCategory === "all"
        ? sourceImages
        : sourceImages.filter((img) => img.category === activeCategory);
    return next;
  }, [activeCategory, sourceImages]);

  useEffect(() => {
    if (!filteredImages.length) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= filteredImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, filteredImages.length]);

  const nextSlide = () => {
    if (!filteredImages.length) return;
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevSlide = () => {
    if (!filteredImages.length) return;
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="lux-kicker">GALERIE</span>
              <span className="h-px w-10 bg-amber-400/70" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gray-900">
              L'ame de notre riad
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Decouvrez l'atmosphere unique et l'architecture de notre demeure.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentIndex(0);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/15"
                  : "bg-white/70 text-gray-800 border-amber-200/60 backdrop-blur hover:bg-amber-50 hover:border-amber-300/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="rounded-3xl border border-amber-200/40 bg-white/70 p-10 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="h-[420px] w-full rounded-3xl bg-amber-100/60" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="rounded-3xl border border-amber-200/40 bg-white/80 p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Aucune image à afficher</p>
            <p className="mt-1 text-sm text-gray-600">Ajoutez des photos depuis l’admin galerie.</p>
          </div>
        ) : (
          <div className="relative mb-8">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[520px] lux-frame overflow-hidden bg-gradient-to-br from-amber-100 via-stone-50 to-amber-200"
            >
              {filteredImages[currentIndex]?.image_url ? (
                <>
                  <img
                    src={filteredImages[currentIndex]?.image_url as string}
                    alt={filteredImages[currentIndex]?.title || "Image"}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,87,71,0.2),transparent_45%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(217,119,6,0.18),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,0,0,0.05),transparent_40%)]" />
                </>
              )}

              <div className="absolute inset-0 flex items-end p-8 md:p-10">
                <div className="lux-panel rounded-2xl px-6 py-5 max-w-xl">
                  <div className="lux-kicker mb-2 text-amber-800">
                    {filteredImages[currentIndex]?.category}
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-amber-950 mb-2">
                    {filteredImages[currentIndex]?.title}
                  </h3>
                  <p className="text-amber-900/80">
                    {filteredImages[currentIndex]?.description || "Une vue de notre maison d’hôtes, entre tradition et élégance."}
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={prevSlide}
                  className="bg-white/80 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
                  type="button"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="bg-white/80 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
                  type="button"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30 transition-colors"
                  type="button"
                >
                  <Maximize2 size={18} />
                  Voir en grand
                </button>
              </div>
            </motion.div>

            <div className="flex justify-center space-x-2 mt-6">
              {filteredImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-amber-700 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  type="button"
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {filteredImages.map((image, index) => (
            <motion.button
              key={image.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square lux-frame overflow-hidden ${
                index === currentIndex
                  ? "ring-4 ring-amber-500 ring-offset-2"
                  : "opacity-75 hover:opacity-100"
              }`}
              type="button"
            >
              {image.image_url ? (
                <img
                  src={image.image_url as string}
                  alt={image.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-stone-50 to-amber-200" />
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {image.title.split(" ")[0]}
                    </span>
                  </div>
                </>
              )}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/galerie"
            className="btn-primary group space-x-3 px-10 py-4 shadow-xl hover:shadow-[0_28px_80px_-40px_rgba(120,87,71,0.7)]"
          >
            <span className="font-semibold">Explorer toute la galerie</span>
            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {lightboxOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-[90vh]">
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-amber-400 z-10"
              >
                X
              </button>
              <div className="bg-white rounded-2xl overflow-hidden w-full">
                {filteredImages[currentIndex]?.image_url ? (
                  <div className="relative">
                    <img
                      src={filteredImages[currentIndex]?.image_url as string}
                      alt={filteredImages[currentIndex]?.title || "Image"}
                      className="max-h-[70vh] w-full object-contain bg-black"
                    />
                  </div>
                ) : null}
                <div className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-6">
                      <Maximize2 size={24} />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      {filteredImages[currentIndex]?.title}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {filteredImages[currentIndex]?.description || "Une vue de notre maison d’hôtes, entre tradition et élégance."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
