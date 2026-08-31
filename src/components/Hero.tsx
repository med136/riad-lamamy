"use client";

import { useEffect, useRef, useState } from "react";
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
  background_image?: string;
  cta_primary_link?: string;
  cta_secondary_link?: string;
}

const FALLBACK_IMAGES = [
  "/images/hero/hero-1.svg",
  "/images/hero/hero-2.svg",
  "/images/hero/hero-3.svg",
];

const FALLBACK_MEDIA: HeroMediaItem[] = FALLBACK_IMAGES.map(
  (mediaUrl, position) => ({
    id: `fallback-${position}`,
    mediaType: "image",
    mediaUrl,
    posterUrl: null,
    altText: null,
    position,
    isActive: true,
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

  const [documentVisible, setDocumentVisible] =
    useState(true);

  const touchStartX = useRef<number | null>(null);

  const videoRefs = useRef(
    new Map<string, HTMLVideoElement>(),
  );

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

    const fetchCarouselImages = async () => {
      try {
        const res = await fetch(
          "/api/hero/carousel",
          {
            cache: "no-store",
          },
        );

        const data = await res.json();

        const items = Array.isArray(data?.items)
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

    fetchSettings();
    fetchCarouselImages();
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      setDocumentVisible(
        document.visibilityState === "visible",
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

    if (!media) {
      return;
    }

    const update = () => {
      setPrefersReducedMotion(media.matches);
    };

    update();

    media.addEventListener?.("change", update);

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
      slides.length <= 1
    ) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((prev) => {
        videoRefs.current
          .get(slides[prev]?.id)
          ?.pause();

        return (prev + 1) % slides.length;
      });
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [
    paused,
    prefersReducedMotion,
    slides,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (slides.length <= 1) {
      return;
    }

    const next =
      slides[(index + 1) % slides.length];

    const preloadUrl =
      next.mediaType === "image"
        ? next.mediaUrl
        : next.posterUrl;

    if (!preloadUrl) {
      return;
    }

    const img = new window.Image();

    img.decoding = "async";
    img.src = preloadUrl;
  }, [index, slides]);

  useEffect(() => {
    const activeVideo =
      videoRefs.current.get(slides[index]?.id);

    if (!activeVideo) {
      return;
    }

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
    slides,
  ]);

  const primaryHref =
    settings?.cta_primary_link ||
    "/reservations";

  const secondaryHref =
    settings?.cta_secondary_link ||
    "/chambres";

  const fallbackBackground =
    settings?.background_image ||
    FALLBACK_IMAGES[0];

  const activeItem =
    slides[index] || {
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
    if (slides.length <= 1) {
      return;
    }

    if (next === index) {
      return;
    }

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(next);
  };

  const goPrev = () => {
    if (slides.length <= 1) {
      return;
    }

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(
      (prev) =>
        (prev - 1 + slides.length) %
        slides.length,
    );
  };

  const goNext = () => {
    if (slides.length <= 1) {
      return;
    }

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(
      (prev) =>
        (prev + 1) % slides.length,
    );
  };

  const onTouchStart = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    touchStartX.current =
      event.touches?.[0]?.clientX ?? null;
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

  return (
    <section
      className="
        group
        relative
        isolate
        min-h-[calc(100vh-5.5rem)]
        overflow-hidden
        bg-[#0f0b08]
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
            className="
              absolute
              inset-0
              h-full
              w-full
            "
            initial={{
              opacity: prefersReducedMotion
                ? 1
                : 0,
              scale: prefersReducedMotion
                ? 1
                : 1.025,
            }}
            animate={{
              opacity: 1,
              scale: prefersReducedMotion
                ? 1
                : 1.055,
            }}
            exit={{
              opacity: prefersReducedMotion
                ? 1
                : 0,
            }}
            transition={{
              opacity: {
                duration: prefersReducedMotion
                  ? 0
                  : FADE_S,
                ease: [0.22, 1, 0.36, 1],
              },

              scale: {
                duration: prefersReducedMotion
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

        {/* Stronger dark treatment on left */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-r
            from-black/80
            via-black/45
            to-black/5
          "
        />

        {/* Bottom depth */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-black/5
            via-transparent
            to-black/30
          "
        />

        {/* Warm glow */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_28%_35%,rgba(190,135,55,0.08),transparent_55%)]
          "
        />
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

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
              max-w-[760px]
              pt-10
              sm:pt-14
              lg:pt-20
            "
          >
            {/* TITLE */}

            <h1
              className="
                font-serif
                text-[54px]
                font-normal
                leading-[0.95]
                tracking-[-0.025em]
                text-[#FFFDF8]
                drop-shadow-[0_10px_28px_rgba(0,0,0,0.48)]
                sm:text-[68px]
                lg:text-[84px]
                xl:text-[96px]
              "
            >
              Dar LaMamy
            </h1>

            {/* DIVIDER */}

            <div
              className="
                mt-7
                flex
                w-[250px]
                items-center
                sm:w-[300px]
                lg:w-[320px]
              "
              aria-hidden="true"
            >
              <span
                className="
                  h-px
                  flex-1
                  bg-[#C89D4A]
                "
              />

              <span
                className="
                  mx-3
                  flex
                  h-[14px]
                  w-[14px]
                  rotate-45
                  items-center
                  justify-center
                  border
                  border-[#C89D4A]
                "
              >
                <span
                  className="
                    h-[4px]
                    w-[4px]
                    bg-[#C89D4A]
                  "
                />
              </span>

              <span
                className="
                  h-px
                  flex-1
                  bg-[#C89D4A]
                "
              />
            </div>

            {/* SUBTITLE */}

            <p
              className="
                mt-6
                font-serif
                text-[20px]
                font-normal
                leading-relaxed
                text-[#FFFDF8]
                drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]
                sm:text-[22px]
                lg:text-[24px]
              "
            >
              Un havre de paix au cœur de Fès
            </p>

            {/* CTA BUTTONS */}

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
              {/* PRIMARY */}

              <Link
                href={primaryHref}
                onClick={() =>
                  trackEvent(
                    "cta_reservation_click",
                    {
                      source: "hero",
                    },
                  )
                }
                className="
                  group/cta
                  inline-flex
                  h-[58px]
                  w-full
                  items-center
                  justify-between
                  gap-8
                  rounded-full

                  border
                  border-[#C89D4A]

                  bg-[#0F5A46]

                  px-8

                  font-sans
                  text-[15px]
                  font-medium
                  text-[#FFFDF8]

                  shadow-[0_8px_24px_rgba(0,0,0,0.18)]

                  transition-all
                  duration-200
                  ease-out

                  hover:-translate-y-px
                  hover:bg-[#12604B]
                  hover:shadow-[0_10px_28px_rgba(0,0,0,0.24)]

                  active:translate-y-0

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#C89D4A]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-transparent

                  sm:w-[260px]
                "
              >
                <span>
                  Découvrir le riad
                </span>

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

              {/* SECONDARY */}

              <Link
                href={secondaryHref}
                onClick={() =>
                  trackEvent(
                    "cta_secondary_click",
                    {
                      source: "hero",
                    },
                  )
                }
                className="
                  group/cta
                  inline-flex
                  h-[58px]
                  w-full
                  items-center
                  justify-between
                  gap-8
                  rounded-full

                  border
                  border-[#C89D4A]

                  bg-[#FFFDF8]

                  px-8

                  font-sans
                  text-[15px]
                  font-medium
                  text-[#174F40]

                  shadow-[0_7px_20px_rgba(0,0,0,0.12)]

                  transition-all
                  duration-200
                  ease-out

                  hover:-translate-y-px
                  hover:bg-[#FFF9EF]
                  hover:shadow-[0_9px_24px_rgba(0,0,0,0.16)]

                  active:translate-y-0

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#C89D4A]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-transparent

                  sm:w-[270px]
                "
              >
                <span>
                  Voir les chambres
                </span>

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

            {/* CAROUSEL CONTROLS */}

            {slides.length > 1 && (
              <div
                className="
                  mt-8
                  flex
                  items-center
                  gap-4
                "
              >
                {/* dots */}

                <nav
                  aria-label="Hero slides"
                  className="
                    flex
                    items-center
                    gap-2
                    opacity-50
                    transition-opacity
                    duration-200
                    group-hover:opacity-100
                    focus-within:opacity-100
                  "
                >
                  {slides.map((_, i) => {
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
                            ? "h-[6px] w-8 bg-[#FFFDF8]/85"
                            : "h-[6px] w-[6px] bg-[#FFFDF8]/40 hover:bg-[#FFFDF8]/65",
                        ].join(" ")}
                      />
                    );
                  })}
                </nav>

                {/* arrows */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    opacity-50
                    transition-opacity
                    duration-200
                    group-hover:opacity-100
                    focus-within:opacity-100
                  "
                >
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Média précédent"
                    className="
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full

                      border
                      border-white/25

                      bg-white/10

                      text-white/90

                      shadow-sm
                      backdrop-blur

                      transition-colors
                      duration-200

                      hover:bg-white/18

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
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full

                      border
                      border-white/25

                      bg-white/10

                      text-white/90

                      shadow-sm
                      backdrop-blur

                      transition-colors
                      duration-200

                      hover:bg-white/18

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
    </section>
  );
}