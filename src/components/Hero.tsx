"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface HeroSettings {
  title: string;
  subtitle: string;
  background_image: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  display_mode?: 'carousel' | 'static';
}

interface CarouselImage {
  id: string;
  image_url: string;
  display_order: number;
}

const defaultImages = [
  "/images/hero/hero-1.svg",
  "/images/hero/hero-2.svg",
  "/images/hero/hero-3.svg",
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [images, setImages] = useState(defaultImages);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const displayMode = settings?.display_mode || 'carousel';

  useEffect(() => {
    fetchSettings();
    fetchCarouselImages();
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;

    const update = () => setPrefersReducedMotion(media.matches);
    update();

    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/hero', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching hero settings:', err);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const res = await fetch('/api/hero/carousel', { cache: 'no-store' });
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      if (res.ok && items.length > 0) {
        const carouselImages = items
          .map((img: CarouselImage) => (img?.image_url || '').trim())
          .filter(Boolean);
        setImages(carouselImages.length ? carouselImages : defaultImages);
      } else {
        setImages(defaultImages);
      }
    } catch (err) {
      console.error('Error fetching carousel images:', err);
      setImages(defaultImages);
    }
  };

  useEffect(() => {
    if (
      displayMode === 'carousel' &&
      images.length > 1 &&
      !paused &&
      !prefersReducedMotion
    ) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 6500);
      return () => clearInterval(interval);
    }
  }, [images.length, displayMode, paused, prefersReducedMotion]);

  const goPrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Mode Carrousel
  if (displayMode === 'carousel') {
    return (
      <section
        className="relative isolate min-h-[calc(100vh-5.5rem)] overflow-hidden bg-[#f7f0e6] py-12 sm:py-14"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background slideshow avec effet parallax */}
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => (
            <motion.div
              key={`${image}-${index}`}
              className="absolute inset-0"
              initial={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              animate={{
                scale: prefersReducedMotion
                  ? 1
                  : index === currentImageIndex
                    ? 1
                    : 1.05,
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                } saturate-[1.04] contrast-[1.02]`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(121,87,71,0.20),transparent_55%)]" />
        </div>

        {/* Contenu centré moderne */}
        <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center pt-10 sm:pt-14 lg:pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="lux-panel space-y-8 rounded-3xl border border-amber-200/55 bg-white/55 px-6 py-10 text-center shadow-[0_38px_120px_-78px_rgba(120,87,71,0.78)] backdrop-blur-xl md:max-w-2xl md:px-10 md:text-left"
              >
                {/* Badge supérieur avec animation */}
                <motion.div
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-amber-200/60 bg-white/70 px-6 py-2 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles size={16} className="text-amber-700" />
                  <span className="text-xs font-semibold text-amber-900 tracking-[0.32em]">★★★★★ Excellence Reconnue</span>
                </motion.div>

                {/* Titre principal avec dégradé */}
                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="font-serif text-5xl font-bold leading-tight text-gray-900 sm:text-6xl lg:text-7xl xl:text-8xl"
                  >
                    <span className="bg-gradient-to-r from-gray-900 via-primary to-amber-800 bg-clip-text text-transparent">
                      {settings?.title || 'Un havre de paix à Marrakech'}
                    </span>
                  </motion.h1>

                  {/* Ligne décoration */}
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 120 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="h-px bg-gradient-to-r from-amber-200/60 via-amber-400/80 to-amber-200/60 mx-auto"
                  ></motion.div>
                </div>

                {/* Description élégante */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 sm:text-xl"
                >
                  {settings?.subtitle || "Découvrez l'authenticité marocaine dans un cadre d'exception au cœur de la médina"}
                </motion.p>

                {/* Boutons CTA modernes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex flex-col gap-4 justify-center pt-4 sm:flex-row md:justify-start"
                >
                  <Link href={settings?.cta_primary_link || '/reservations'}>
                    <motion.button
                      onClick={() => trackEvent('cta_reservation_click', { source: 'hero' })}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary group space-x-2 px-8 py-4 transition-all duration-300 sm:px-10"
                    >
                      <span>{settings?.cta_primary_text || 'Reserver maintenant'}</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>

                  <Link href={settings?.cta_secondary_link || '/chambres'}>
                    <motion.button
                      onClick={() => trackEvent('cta_secondary_click', { source: 'hero' })}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary group space-x-2 bg-white px-8 py-4 transition-all duration-300 sm:px-10"
                    >
                      <span>{settings?.cta_secondary_text || 'En savoir plus'}</span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Stats avec animation staggered */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="grid grid-cols-2 gap-6 border-t border-amber-200/40 pt-10 md:grid-cols-4"
                >
                  {[
                    { number: '12', label: 'Chambres' },
                    { number: '5★', label: 'Service' },
                    { number: '20+', label: 'Années' },
                    { number: '100%', label: 'Satisfaction' }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + idx * 0.1 }}
                      className="text-center"
                    >
                      <div className="bg-gradient-to-r from-primary via-amber-800 to-primary bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                        {stat.number}
                      </div>
                      <div className="mt-1 text-xs text-gray-600 sm:text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Indicateur de scroll amélioré */}
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-6 md:flex">
            <button
              type="button"
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/55 text-gray-900 shadow-sm backdrop-blur-md transition hover:bg-white/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
              onClick={goPrev}
              aria-label="Image précédente"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/55 text-gray-900 shadow-sm backdrop-blur-md transition hover:bg-white/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
              onClick={goNext}
              aria-label="Image suivante"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
        )}

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="text-gray-700 text-xs font-semibold uppercase tracking-widest opacity-80">Découvrir</div>
            <div className="bg-white/70 backdrop-blur-md rounded-full p-2 shadow-sm border border-amber-200/60">
              <ChevronDown size={24} className="text-amber-800 animate-bounce" />
            </div>
          </div>
        </motion.div>

        {/* Carousel indicators avec animation */}
        {images.length > 1 && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`Aller à l'image ${idx + 1}`}
                className={`rounded-full transition-all ${
                  idx === currentImageIndex
                    ? 'bg-amber-800 w-8'
                    : 'bg-amber-800/25 w-2 hover:bg-amber-800/40'
                }`}
                style={{ height: 2 }}
                whileHover={{ scale: 1.1 }}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Mode Statique (image unique)
  return (
    <section className="relative isolate min-h-[calc(100vh-5.5rem)] overflow-hidden bg-[#f7f0e6] py-12 sm:py-14">
      {/* Background avec effet parallax */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.background_image || defaultImages[0]}
          alt="Hero Background"
          className="absolute inset-0 h-full w-full object-cover saturate-[1.04] contrast-[1.02]"
          loading="eager"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(121,87,71,0.20),transparent_55%)]" />
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center pt-10 sm:pt-14 lg:pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="lux-panel space-y-8 rounded-3xl border border-amber-200/55 bg-white/55 px-6 py-10 text-center shadow-[0_38px_120px_-78px_rgba(120,87,71,0.78)] backdrop-blur-xl md:max-w-2xl md:px-10 md:text-left"
            >
              {/* Badge supérieur */}
              <motion.div
                className="inline-flex items-center justify-center gap-3 rounded-full border border-amber-200/60 bg-white/70 px-6 py-2 shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles size={16} className="text-amber-700" />
                <span className="text-xs font-semibold text-amber-900 tracking-[0.32em]">★★★★★ Excellence Reconnue</span>
              </motion.div>

              {/* Titre principal */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="font-serif text-5xl font-bold leading-tight text-gray-900 sm:text-6xl lg:text-7xl xl:text-8xl"
                >
                  <span className="bg-gradient-to-r from-gray-900 via-primary to-amber-800 bg-clip-text text-transparent">
                    {settings?.title || 'Un havre de paix à Marrakech'}
                  </span>
                </motion.h1>

                {/* Ligne décoration */}
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 120 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="h-px bg-gradient-to-r from-amber-200/60 via-amber-400/80 to-amber-200/60 mx-auto"
                ></motion.div>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 sm:text-xl"
              >
                {settings?.subtitle || "Découvrez l'authenticité marocaine dans un cadre d'exception au cœur de la médina"}
              </motion.p>

              {/* Boutons CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col gap-4 justify-center pt-4 sm:flex-row md:justify-start"
              >
                <Link href={settings?.cta_primary_link || '/reservations'}>
                  <motion.button
                    onClick={() => trackEvent('cta_reservation_click', { source: 'hero' })}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center justify-center space-x-2 whitespace-nowrap rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/95 sm:px-10"
                  >
                    <span>{settings?.cta_primary_text || 'Reserver maintenant'}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <Link href={settings?.cta_secondary_link || '/chambres'}>
                  <motion.button
                    onClick={() => trackEvent('cta_secondary_click', { source: 'hero' })}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center justify-center space-x-2 whitespace-nowrap rounded-full border border-amber-200/70 bg-white px-8 py-4 font-semibold text-gray-900 shadow-sm transition-all duration-300 hover:bg-amber-50 sm:px-10"
                  >
                    <span>{settings?.cta_secondary_text || 'En savoir plus'}</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="grid grid-cols-2 gap-6 border-t border-amber-200/40 pt-10 md:grid-cols-4"
              >
                {[
                  { number: '12', label: 'Chambres' },
                  { number: '5★', label: 'Service' },
                  { number: '20+', label: 'Années' },
                  { number: '100%', label: 'Satisfaction' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-r from-primary via-amber-800 to-primary bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                      {stat.number}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 sm:text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="text-gray-700 text-xs font-semibold uppercase tracking-widest opacity-80">Découvrir</div>
          <div className="bg-white/70 backdrop-blur-md rounded-full p-2 shadow-sm border border-amber-200/60">
            <ChevronDown size={24} className="text-amber-800 animate-bounce" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
