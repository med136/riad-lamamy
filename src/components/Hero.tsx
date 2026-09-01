"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import { HeroSlideMedia } from "@/components/HeroSlideMedia";
import {
  toHeroMediaItem,
  type HeroMediaApiItem,
  type HeroMediaItem,
} from "@/types/hero-media";

interface HeroSettings {
  title?: string;
  subtitle?: string;
  background_image?: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  is_active?: boolean;
  display_mode?: "carousel" | "static";
}

const FALLBACK_IMAGES = [
  "/images/hero/hero-1.svg",
  "/images/hero/hero-2.svg",
  "/images/hero/hero-3.svg",
];

const FALLBACK_MEDIA: HeroMediaItem[] =
  FALLBACK_IMAGES.map(
    (mediaUrl, position) => ({
      id: `fallback-${position}`,
      mediaType: "image",
      mediaUrl,
      posterUrl: null,
      altText: null,
      position,
      isActive: true,
      filename: null,
      mimeType: null,
      size: null,
    }),
  );

const MAX_SLIDES = 5;
const AUTOPLAY_MS = 7500;
const FADE_S = 1.8;
const SWIPE_THRESHOLD_PX = 52;

export function Hero() {
  const [settings, setSettings] =
    useState<HeroSettings | null>(null);

  const [slides, setSlides] =
    useState<HeroMediaItem[]>(FALLBACK_MEDIA);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const [
    prefersReducedMotion,
    setPrefersReducedMotion,
  ] = useState(false);

  const [
    documentVisible,
    setDocumentVisible,
  ] = useState(true);

  const touchStartX =
    useRef<number | null>(null);

  const videoRefs = useRef(
    new Map<string, HTMLVideoElement>(),
  );

  const heroSlides =
    useMemo<HeroMediaItem[]>(() => {
      if (
        settings?.display_mode === "static"
      ) {
        return [
          {
            ...FALLBACK_MEDIA[0],
            id: "static-background",
            mediaUrl:
              settings?.background_image ||
              FALLBACK_IMAGES[0],
            position: 0,
          },
        ];
      }

      return slides.length
        ? slides
        : FALLBACK_MEDIA;
    }, [
      settings?.background_image,
      settings?.display_mode,
      slides,
    ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/hero", {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok && data) {
          setSettings(data);
        }
      } catch (err) {
        console.error(
          "Error fetching hero settings:",
          err,
        );
      }
    };

    const fetchCarouselImages =
      async () => {
        try {
          const res = await fetch(
            "/api/hero/carousel",
            {
              cache: "no-store",
            },
          );

          const data = await res.json();

          const items = Array.isArray(
            data?.items,
          )
            ? data.items
            : [];

          if (res.ok && items.length > 0) {
            const carouselMedia = (
              items as HeroMediaApiItem[]
            )
              .map(toHeroMediaItem)
              .filter(
                (item) =>
                  item.isActive &&
                  item.mediaUrl.trim(),
              )
              .slice(0, MAX_SLIDES);

            setSlides(
              carouselMedia.length
                ? carouselMedia
                : FALLBACK_MEDIA,
            );

            return;
          }

          setSlides(FALLBACK_MEDIA);
        } catch (err) {
          console.error(
            "Error fetching carousel images:",
            err,
          );

          setSlides(FALLBACK_MEDIA);
        }
      };

    void fetchSettings();
    void fetchCarouselImages();
  }, []);

  useEffect(() => {
    if (index >= heroSlides.length) {
      setIndex(0);
    }
  }, [heroSlides.length, index]);

  useEffect(() => {
    const updateVisibility = () => {
      setDocumentVisible(
        document.visibilityState ===
          "visible",
      );
    };

    updateVisibility();

    document.addEventListener(
      "visibilitychange",
      updateVisibility,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        updateVisibility,
      );
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );

    if (!media) return;

    const update = () => {
      setPrefersReducedMotion(
        media.matches,
      );
    };

    update();

    media.addEventListener?.(
      "change",
      update,
    );

    return () => {
      media.removeEventListener?.(
        "change",
        update,
      );
    };
  }, []);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      paused ||
      heroSlides.length <= 1
    ) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((prev) => {
        videoRefs.current
          .get(heroSlides[prev]?.id)
          ?.pause();

        return (prev + 1) % heroSlides.length;
      });
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [
    paused,
    prefersReducedMotion,
    heroSlides,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (heroSlides.length <= 1) {
      return;
    }

    const next =
      heroSlides[
        (index + 1) % heroSlides.length
      ];

    const preloadUrl =
      next.mediaType === "image"
        ? next.mediaUrl
        : next.posterUrl;

    if (!preloadUrl) return;

    const img = new window.Image();
    img.decoding = "async";
    img.src = preloadUrl;
  }, [index, heroSlides]);

  useEffect(() => {
    const activeVideo =
      videoRefs.current.get(
        heroSlides[index]?.id,
      );

    if (!activeVideo) return;

    if (
      !documentVisible ||
      prefersReducedMotion
    ) {
      activeVideo.pause();
      return;
    }

    void activeVideo
      .play()
      .catch(() => undefined);
  }, [
    documentVisible,
    index,
    prefersReducedMotion,
    heroSlides,
  ]);

  const primaryHref =
    settings?.cta_primary_link ||
    "/reservations";

  const secondaryHref =
    settings?.cta_secondary_link ||
    "/chambres";

  const title =
    settings?.title || "Dar LaMamy";

  const subtitle =
    settings?.subtitle ||
    "Un havre de paix au cœur de Fès";

  const primaryLabel =
    settings?.cta_primary_text ||
    "Découvrir le riad";

  const secondaryLabel =
    settings?.cta_secondary_text ||
    "Voir les chambres";

  const fallbackBackground =
    settings?.background_image ||
    FALLBACK_IMAGES[0];

  const activeItem =
    heroSlides[index] ||
    heroSlides[0] || {
      ...FALLBACK_MEDIA[0],
      mediaUrl: fallbackBackground,
    };

  const registerVideo = (
    id: string,
    element: HTMLVideoElement | null,
  ) => {
    if (element) {
      videoRefs.current.set(id, element);
    } else {
      videoRefs.current.delete(id);
    }
  };

  const goTo = (next: number) => {
    if (heroSlides.length <= 1) return;
    if (next === index) return;

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(next);
  };

  const goPrev = () => {
    if (heroSlides.length <= 1) return;

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(
      (prev) =>
        (prev - 1 + heroSlides.length) %
        heroSlides.length,
    );
  };

  const goNext = () => {
    if (heroSlides.length <= 1) return;

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(
      (prev) =>
        (prev + 1) % heroSlides.length,
    );
  };

  const onTouchStart = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    touchStartX.current =
      event.touches?.[0]?.clientX ??
      null;
  };

  const onTouchEnd = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    const start = touchStartX.current;
    const end =
      event.changedTouches?.[0]?.clientX ??
      null;

    touchStartX.current = null;

    if (start === null || end === null) {
      return;
    }

    const delta = end - start;

    if (
      Math.abs(delta) <
      SWIPE_THRESHOLD_PX
    ) {
      return;
    }

    if (delta > 0) {
      goPrev();
    } else {
      goNext();
    }
  };

  if (settings?.is_active === false)
    return null;

  return (
    <section
      className="
        group
        relative
        isolate
        min-h-[calc(100vh-5.5rem)]
        overflow-hidden
        bg-[#f6f1e8]
        touch-pan-y
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeItem.id}
            className="absolute inset-0 h-full w-full"
            initial={{
              opacity: prefersReducedMotion
                ? 1
                : 0,
              scale: prefersReducedMotion
                ? 1
                : 1.02,
            }}
            animate={{
              opacity: 1,
              scale: prefersReducedMotion
                ? 1
                : 1.05,
            }}
            exit={{
              opacity: prefersReducedMotion
                ? 1
                : 0,
            }}
            transition={{
              opacity: {
                duration:
                  prefersReducedMotion
                    ? 0
                    : FADE_S,
                ease: [0.22, 1, 0.36, 1],
              },
              scale: {
                duration:
                  prefersReducedMotion
                    ? 0
                    : AUTOPLAY_MS / 1000 +
                      0.5,
                ease: "linear",
              },
            }}
          >
            <HeroSlideMedia
              item={activeItem}
              isFirst={index === 0}
              prefersReducedMotion={
                prefersReducedMotion
              }
              documentVisible={
                documentVisible
              }
              registerVideo={registerVideo}
            />
          </motion.div>
        </AnimatePresence>

        {/* léger voile chaud, pas noir */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[linear-gradient(90deg,rgba(255,253,248,0.14)_0%,rgba(255,253,248,0.06)_28%,rgba(255,253,248,0.00)_55%)]
          "
        />

        {/* glow premium subtil */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_20%_32%,rgba(200,157,74,0.10),transparent_36%)]
          "
        />
      </div>

      {/* Content */}
      <div
        className="
          relative
          z-10
          flex
          min-h-[calc(100vh-5.5rem)]
          items-center
        "
      >
        <div
          className="
            w-full
            px-5
            sm:px-8
            lg:px-[4.2vw]
          "
        >
          <div
            className="
              max-w-[680px]
              pt-10
              sm:pt-14
              lg:pt-20
            "
          >
            <div
              className="
                rounded-[30px]
                border
                border-white/45
                bg-[rgba(255,253,248,0.72)]
                p-6
                shadow-[0_24px_80px_-30px_rgba(31,23,18,0.32)]
                backdrop-blur-md
                sm:p-8
                lg:p-10
              "
            >
              <p
                className="
                  mb-4
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.30em]
                  text-[#B28A47]
                "
              >
                Maison d’hôtes de charme à Fès
              </p>

              <h1
                className="
                  font-serif
                  text-[46px]
                  font-medium
                  leading-[0.96]
                  tracking-[-0.03em]
                  text-[#1B1612]
                  sm:text-[58px]
                  lg:text-[72px]
                  xl:text-[82px]
                "
              >
                {title}
              </h1>

              <div
                className="
                  mt-5
                  flex
                  w-[190px]
                  items-center
                  sm:w-[230px]
                "
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-[#C89D4A]" />

                <span
                  className="
                    mx-3
                    h-[8px]
                    w-[8px]
                    rotate-45
                    border
                    border-[#C89D4A]
                  "
                />

                <span className="h-px flex-1 bg-[#C89D4A]" />
              </div>

              <p
                className="
                  mt-5
                  max-w-[560px]
                  text-[17px]
                  leading-relaxed
                  text-[#4F463F]
                  sm:text-[18px]
                  lg:text-[19px]
                "
              >
                {subtitle}
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                "
              >
                <Link
                  href={primaryHref}
                  onClick={() =>
                    trackEvent(
                      "cta_reservation_click",
                      { source: "hero" },
                    )
                  }
                  className="
                    group/cta
                    inline-flex
                    h-[56px]
                    w-full
                    items-center
                    justify-between
                    gap-8
                    rounded-full
                    border
                    border-[#C89D4A]
                    bg-[#0F5A46]
                    px-7
                    text-[15px]
                    font-semibold
                    text-[#FFFDF8]
                    shadow-[0_10px_24px_rgba(15,90,70,0.18)]
                    transition-all
                    duration-200
                    hover:-translate-y-px
                    hover:bg-[#12604B]
                    hover:shadow-[0_14px_30px_rgba(15,90,70,0.24)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C89D4A]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-transparent
                    sm:w-[245px]
                  "
                >
                  <span>{primaryLabel}</span>

                  <ArrowRight
                    className="
                      h-[18px]
                      w-[18px]
                      shrink-0
                      text-[#D2AA5A]
                      transition-transform
                      duration-200
                      group-hover/cta:translate-x-1
                    "
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href={secondaryHref}
                  onClick={() =>
                    trackEvent(
                      "cta_secondary_click",
                      { source: "hero" },
                    )
                  }
                  className="
                    group/cta
                    inline-flex
                    h-[56px]
                    w-full
                    items-center
                    justify-between
                    gap-8
                    rounded-full
                    border
                    border-[#D8C29A]
                    bg-white/88
                    px-7
                    text-[15px]
                    font-semibold
                    text-[#174F40]
                    shadow-[0_8px_20px_rgba(20,20,20,0.08)]
                    transition-all
                    duration-200
                    hover:-translate-y-px
                    hover:bg-white
                    hover:shadow-[0_10px_24px_rgba(20,20,20,0.12)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C89D4A]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-transparent
                    sm:w-[255px]
                  "
                >
                  <span>{secondaryLabel}</span>

                  <ArrowRight
                    className="
                      h-[18px]
                      w-[18px]
                      shrink-0
                      text-[#C89D4A]
                      transition-transform
                      duration-200
                      group-hover/cta:translate-x-1
                    "
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {heroSlides.length > 1 && (
                <div
                  className="
                    mt-8
                    flex
                    flex-wrap
                    items-center
                    gap-4
                    border-t
                    border-[#B28A47]/15
                    pt-6
                  "
                >
                  <nav
                    aria-label="Hero slides"
                    className="flex items-center gap-2"
                  >
                    {heroSlides.map((_, i) => {
                      const active =
                        i === index;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            goTo(i)
                          }
                          aria-label={`Aller à la slide ${
                            i + 1
                          }`}
                          aria-current={
                            active
                              ? "true"
                              : undefined
                          }
                          className={[
                            `
                              rounded-full
                              transition-all
                              duration-200
                              focus-visible:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-[#D2AA5A]
                              focus-visible:ring-offset-2
                              focus-visible:ring-offset-transparent
                            `,
                            active
                              ? "h-[7px] w-9 bg-[#0F5A46]"
                              : "h-[7px] w-[7px] bg-[#B28A47]/35 hover:bg-[#B28A47]/60",
                          ].join(" ")}
                        />
                      );
                    })}
                  </nav>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Média précédent"
                      className="
                        inline-flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#B28A47]/20
                        bg-white/78
                        text-[#1B1612]
                        shadow-sm
                        backdrop-blur
                        transition-colors
                        duration-200
                        hover:bg-white
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#D2AA5A]
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-transparent
                      "
                    >
                      <ChevronLeft
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Image suivante"
                      className="
                        inline-flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#B28A47]/20
                        bg-white/78
                        text-[#1B1612]
                        shadow-sm
                        backdrop-blur
                        transition-colors
                        duration-200
                        hover:bg-white
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#D2AA5A]
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-transparent
                      "
                    >
                      <ChevronRight
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}