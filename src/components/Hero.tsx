"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface HeroSettings {
  background_image?: string;
  cta_primary_link?: string;
  cta_secondary_link?: string;
}

interface CarouselImage {
  id: string;
  image_url: string;
  display_order: number;
}

const FALLBACK_IMAGES = [
  "/images/hero/hero-1.svg",
  "/images/hero/hero-2.svg",
  "/images/hero/hero-3.svg",
];

const MAX_SLIDES = 5;
const AUTOPLAY_MS = 7500; // 6–8s
const FADE_S = 1.8; // cross-fade ultra douce
const SWIPE_THRESHOLD_PX = 52;

export function Hero() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [slides, setSlides] = useState<string[]>(FALLBACK_IMAGES);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/hero", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data) setSettings(data);
      } catch (err) {
        console.error("Error fetching hero settings:", err);
      }
    };

    const fetchCarouselImages = async () => {
      try {
        const res = await fetch("/api/hero/carousel", { cache: "no-store" });
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];

        if (res.ok && items.length > 0) {
          const carouselImages = items
            .map((img: CarouselImage) => (img?.image_url || "").trim())
            .filter(Boolean)
            .slice(0, MAX_SLIDES);

          setSlides(carouselImages.length ? carouselImages : FALLBACK_IMAGES);
          return;
        }

        setSlides(FALLBACK_IMAGES);
      } catch (err) {
        console.error("Error fetching carousel images:", err);
        setSlides(FALLBACK_IMAGES);
      }
    };

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

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    if (prefersReducedMotion || paused || slides.length <= 1) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion, slides.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (slides.length <= 1) return;

    const next = slides[(index + 1) % slides.length];
    const img = new window.Image();
    img.decoding = "async";
    img.src = next;
  }, [index, slides]);

  const primaryHref = settings?.cta_primary_link || "/reservations";
  const secondaryHref = settings?.cta_secondary_link || "/chambres";
  const fallbackBackground = settings?.background_image || FALLBACK_IMAGES[0];

  const activeSrc = slides[index] || fallbackBackground;

  const goTo = (next: number) => {
    if (slides.length <= 1) return;
    if (next === index) return;
    setIndex(next);
  };

  const goPrev = () => {
    if (slides.length <= 1) return;
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (slides.length <= 1) return;
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const start = touchStartX.current;
    const end = e.changedTouches?.[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start === null || end === null) return;

    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  return (
    <section
      className="group relative isolate min-h-[calc(100vh-5.5rem)] overflow-hidden bg-[#0f0b08] touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background carousel (immersion, cross-fade discret) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={activeSrc}
            src={activeSrc}
            alt=""
            aria-hidden="true"
            role="presentation"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{
              opacity: prefersReducedMotion ? 1 : 0,
              scale: prefersReducedMotion ? 1 : 1.035,
            }}
            animate={{
              opacity: 1,
              scale: prefersReducedMotion ? 1 : 1.06,
            }}
            exit={{
              opacity: prefersReducedMotion ? 1 : 0,
            }}
            transition={{
              opacity: {
                duration: prefersReducedMotion ? 0 : FADE_S,
                ease: [0.22, 1, 0.36, 1],
              },
              scale: {
                duration: prefersReducedMotion ? 0 : AUTOPLAY_MS / 1000 + 0.5,
                ease: "linear",
              },
            }}
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(184,111,74,0.20),transparent_55%)]" />
      </div>

      {/* Overlay content (fixe, magazine-luxe) */}
      <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center py-12 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl">
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-xl lg:w-[44%]">
                {/* Contenu (sans fond de cadre) */}
                <div className="space-y-7 text-center sm:text-left">
                  <div className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 shadow-sm backdrop-blur-sm sm:justify-start">
                    {"\u2605\u2605\u2605\u2605\u2605 Excellence reconnue"}
                  </div>

                  <div className="space-y-4">
                    <h1 className="font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-white drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
                      Riad Lamamy
                    </h1>
                    <div className="mx-auto h-px w-24 bg-gradient-to-r from-white/10 via-amber-100/55 to-white/10 sm:mx-0" />
                  </div>

                  <p className="max-w-[34rem] font-sans text-base font-light leading-relaxed tracking-wide text-white/85 drop-shadow-[0_10px_22px_rgba(0,0,0,0.50)] sm:text-lg">
                    {"Un refuge confidentiel au c\u0153ur de Marrakech"}
                  </p>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <Link
                      href={primaryHref}
                      onClick={() =>
                        trackEvent("cta_reservation_click", { source: "hero" })
                      }
                      className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#1c120c] shadow-[0_18px_60px_-34px_rgba(0,0,0,0.80)] transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto"
                    >
                      <span>{"R\u00E9server maintenant"}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>

                    <Link
                      href={secondaryHref}
                      onClick={() =>
                        trackEvent("cta_secondary_click", { source: "hero" })
                      }
                      className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/45 bg-white/0 px-7 py-3.5 text-sm font-semibold text-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto"
                    >
                      {"D\u00E9couvrir les chambres"}
                    </Link>
                  </div>
                </div>

                {/* Navigation séparée (dots + boutons) */}
                {slides.length > 1 && (
                  <div className="mt-7 flex items-center justify-center gap-4 sm:justify-start">
                    <nav
                      aria-label="Hero slides"
                      className="flex items-center gap-2 opacity-50 transition-opacity group-hover:opacity-95 focus-within:opacity-95"
                    >
                      {slides.map((_, i) => {
                        const active = i === index;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Aller \u00E0 la slide ${i + 1}`}
                            aria-current={active ? "true" : undefined}
                            className={[
                              "rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                              active
                                ? "h-[6px] w-8 bg-amber-100/80"
                                : "h-[6px] w-[6px] bg-amber-100/35 hover:bg-amber-100/55",
                            ].join(" ")}
                          />
                        );
                      })}
                    </nav>

                    <div className="flex items-center gap-2 opacity-50 transition-opacity group-hover:opacity-95 focus-within:opacity-95">
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label={"Image pr\u00E9c\u00E9dente"}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Image suivante"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
