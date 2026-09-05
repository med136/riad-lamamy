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
import { useLanguage } from "@/components/LanguageProvider";
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

const FALLBACK_MEDIA: HeroMediaItem[] = FALLBACK_IMAGES.map(
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
  const { t } = useLanguage();

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

  const touchStartX = useRef<number | null>(null);

  const videoRefs = useRef(
    new Map<string, HTMLVideoElement>(),
  );

  const heroSlides = useMemo<HeroMediaItem[]>(() => {
    if (settings?.display_mode === "static") {
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

  /* =========================================================
     LOAD HERO SETTINGS + CAROUSEL
     ========================================================= */

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

    void fetchSettings();
    void fetchCarouselImages();
  }, []);

  /* =========================================================
     KEEP INDEX VALID
     ========================================================= */

  useEffect(() => {
    if (index >= heroSlides.length) {
      setIndex(0);
    }
  }, [heroSlides.length, index]);

  /* =========================================================
     DOCUMENT VISIBILITY
     ========================================================= */

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

  /* =========================================================
     REDUCED MOTION
     ========================================================= */

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

  /* =========================================================
     AUTOPLAY
     ========================================================= */

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

        return (
          (prev + 1) %
          heroSlides.length
        );
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

  /* =========================================================
     PRELOAD NEXT SLIDE
     ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (heroSlides.length <= 1) {
      return;
    }

    const next =
      heroSlides[
        (index + 1) %
          heroSlides.length
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

  /* =========================================================
     ACTIVE VIDEO
     ========================================================= */

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

  /* =========================================================
     SETTINGS / LABELS
     ========================================================= */

  const primaryHref =
    settings?.cta_primary_link ||
    "/reservations";

  const secondaryHref =
    settings?.cta_secondary_link ||
    "/chambres";

  const title =
    settings?.title ||
    t("home.hero.title");

  const subtitle =
    settings?.subtitle ||
    t("home.hero.subtitle");

  const primaryLabel =
    settings?.cta_primary_text ||
    t("home.hero.primary_cta");

  const secondaryLabel =
    settings?.cta_secondary_text ||
    t("home.hero.secondary_cta");

  const fallbackBackground =
    settings?.background_image ||
    FALLBACK_IMAGES[0];

  const activeItem =
    heroSlides[index] ||
    heroSlides[0] || {
      ...FALLBACK_MEDIA[0],
      mediaUrl: fallbackBackground,
    };

  /* =========================================================
     VIDEO REGISTER
     ========================================================= */

  const registerVideo = (
    id: string,
    element: HTMLVideoElement | null,
  ) => {
    if (element) {
      videoRefs.current.set(
        id,
        element,
      );
    } else {
      videoRefs.current.delete(id);
    }
  };

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const goTo = (next: number) => {
    if (heroSlides.length <= 1) {
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
    if (heroSlides.length <= 1) {
      return;
    }

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(
      (prev) =>
        (prev -
          1 +
          heroSlides.length) %
        heroSlides.length,
    );
  };

  const goNext = () => {
    if (heroSlides.length <= 1) {
      return;
    }

    videoRefs.current
      .get(activeItem.id)
      ?.pause();

    setIndex(
      (prev) =>
        (prev + 1) %
        heroSlides.length,
    );
  };

  /* =========================================================
     SWIPE
     ========================================================= */

  const onTouchStart = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    touchStartX.current =
      event.touches?.[0]
        ?.clientX ?? null;
  };

  const onTouchEnd = (
    event: React.TouchEvent<HTMLElement>,
  ) => {
    const start =
      touchStartX.current;

    const end =
      event.changedTouches?.[0]
        ?.clientX ?? null;

    touchStartX.current = null;

    if (
      start === null ||
      end === null
    ) {
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

  if (
    settings?.is_active === false
  ) {
    return null;
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section
      className="
        group
        relative
        isolate
        min-h-[calc(100vh-5.5rem)]
        overflow-hidden
        bg-[#17130f]
        touch-pan-y
      "
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* =====================================================
          BACKGROUND CAROUSEL
          ===================================================== */}

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
              opacity:
                prefersReducedMotion
                  ? 1
                  : 0,

              scale:
                prefersReducedMotion
                  ? 1
                  : 1.015,
            }}
            animate={{
              opacity: 1,

              scale:
                prefersReducedMotion
                  ? 1
                  : 1.045,
            }}
            exit={{
              opacity:
                prefersReducedMotion
                  ? 1
                  : 0,
            }}
            transition={{
              opacity: {
                duration:
                  prefersReducedMotion
                    ? 0
                    : FADE_S,

                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              },

              scale: {
                duration:
                  prefersReducedMotion
                    ? 0
                    : AUTOPLAY_MS /
                        1000 +
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
              registerVideo={
                registerVideo
              }
            />
          </motion.div>
        </AnimatePresence>

        {/* ===================================================
            DARK LEFT OVERLAY
            =================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[linear-gradient(90deg,rgba(17,14,11,0.82)_0%,rgba(17,14,11,0.66)_18%,rgba(17,14,11,0.38)_34%,rgba(17,14,11,0.14)_50%,rgba(17,14,11,0.02)_66%,rgba(17,14,11,0)_76%)]
          "
        />

        {/* mobile readability */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[linear-gradient(180deg,rgba(12,9,7,0.12)_0%,rgba(12,9,7,0.04)_32%,rgba(12,9,7,0.20)_100%)]
            lg:bg-[linear-gradient(180deg,rgba(12,9,7,0.03)_40%,rgba(12,9,7,0.20)_100%)]
          "
        />

        {/* premium warmth */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_17%_43%,rgba(178,138,71,0.14),transparent_38%)]
          "
        />
      </div>

      {/* =====================================================
          HERO CONTENT
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
            px-6
            sm:px-10
            lg:px-[5.8vw]
          "
        >
          <div
            className="
             max-w-[660px]
py-16
sm:py-20
lg:py-24
            "
          >
            {/* KICKER */}

            <motion.p
              key={`kicker-${activeItem.id}`}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 12,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.34em]
                text-[#D8B46E]
                sm:text-[10px]
                lg:text-[11px]
              "
            >
              {t(
                "home.hero.kicker",
              )}
            </motion.p>

            {/* GOLD DIVIDER */}

            <motion.div
              key={`divider-${activeItem.id}`}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      scaleX: 0,
                    }
              }
              animate={{
                opacity: 1,
                scaleX: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.18,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                mt-5
                flex
                w-[215px]
                origin-left
                items-center
                sm:w-[240px]
              "
              aria-hidden="true"
            >
              <span
                className="
                  h-px
                  w-[100px]
                  bg-[#D2AA5A]/90
                  sm:w-[112px]
                "
              />

              <span
                className="
                  mx-3
                  h-[7px]
                  w-[7px]
                  rotate-45
                  border
                  border-[#D2AA5A]/90
                "
              />

              <span
                className="
                  h-px
                  flex-1
                  bg-[#D2AA5A]/45
                "
              />
            </motion.div>

            {/* TITLE */}
{/* TITLE */}
<motion.h1
  key={`title-${activeItem.id}`}
  initial={
    prefersReducedMotion
      ? false
      : {
          opacity: 0,
          y: 20,
        }
  }
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    duration: 0.85,
    delay: 0.16,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="
    mt-6
    max-w-[560px]
    font-serif
    text-[38px]
    font-medium
    leading-[1.02]
    tracking-[-0.03em]
    text-[#FFFDF8]
    drop-shadow-[0_4px_22px_rgba(0,0,0,0.22)]
    sm:text-[46px]
    lg:text-[54px]
    xl:text-[60px]
  "
>
  {title}
</motion.h1>

{/* DESCRIPTION */}
<motion.p
  key={`subtitle-${activeItem.id}`}
  initial={
    prefersReducedMotion
      ? false
      : {
          opacity: 0,
          y: 16,
        }
  }
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    duration: 0.8,
    delay: 0.28,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="
    mt-5
    max-w-[520px]
    text-[14px]
    font-light
    leading-[1.7]
    text-[#F3EEE6]
    drop-shadow-[0_2px_12px_rgba(0,0,0,0.22)]
    sm:text-[15px]
    lg:text-[16px]
  "
>
  {subtitle}
</motion.p>

            {/* =================================================
                CTA
                ================================================= */}

            <motion.div
              key={`buttons-${activeItem.id}`}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 14,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.38,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                mt-8
                flex
                flex-col
                gap-3
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
                      source:
                        "hero",
                    },
                  )
                }
                className="
                  group/primary
                  inline-flex
                  h-[52px]
                  w-full
                  items-center
                  justify-between
                  gap-8
                  rounded-full
                  border
                  border-[#D2AA5A]/85
                  bg-[#0F5A46]
                  px-6
                  text-[13px]
                  font-semibold
                  text-[#FFFDF8]
                  shadow-[0_14px_34px_-16px_rgba(0,0,0,0.55)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-[#D2AA5A]
                  hover:bg-[#0B4A3A]
                  hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.62)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#D2AA5A]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-transparent
                  sm:w-[235px]
                  lg:h-[54px]
                  lg:text-[14px]
                "
              >
                <span>
                  {primaryLabel}
                </span>

                <ArrowRight
                  className="
                    h-[17px]
                    w-[17px]
                    shrink-0
                    text-[#D2AA5A]
                    transition-transform
                    duration-300
                    group-hover/primary:translate-x-1
                  "
                  strokeWidth={1.7}
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
                      source:
                        "hero",
                    },
                  )
                }
                className="
                  group/secondary
                  inline-flex
                  h-[52px]
                  w-full
                  items-center
                  justify-between
                  gap-8
                  rounded-full
                  border
                  border-white/40
                  bg-black/10
                  px-6
                  text-[13px]
                  font-semibold
                  text-[#FFFDF8]
                  backdrop-blur-[2px]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-[#D2AA5A]/85
                  hover:bg-black/22
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#D2AA5A]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-transparent
                  sm:w-[235px]
                  lg:h-[54px]
                  lg:text-[14px]
                "
              >
                <span>
                  {secondaryLabel}
                </span>

                <ArrowRight
                  className="
                    h-[17px]
                    w-[17px]
                    shrink-0
                    text-[#D2AA5A]
                    transition-transform
                    duration-300
                    group-hover/secondary:translate-x-1
                  "
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CAROUSEL NAVIGATION
          ===================================================== */}

      {heroSlides.length > 1 && (
        <>
          {/* DOTS */}

          <nav
            aria-label={t(
              "home.hero.slides_label",
            )}
            className="
              absolute
              bottom-6
              left-1/2
              z-20
              flex
              -translate-x-1/2
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-black/10
              px-3
              py-2
              backdrop-blur-sm
              sm:bottom-7
            "
          >
            {heroSlides.map(
              (_, i) => {
                const active =
                  i === index;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      goTo(i)
                    }
                    aria-label={`${t(
                      "home.hero.go_to_slide",
                    )} ${i + 1}`}
                    aria-current={
                      active
                        ? "true"
                        : undefined
                    }
                    className={`
                      rounded-full
                      transition-all
                      duration-300
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#D2AA5A]

                      ${
                        active
                          ? `
                            h-[6px]
                            w-8
                            bg-[#D2AA5A]
                          `
                          : `
                            h-[6px]
                            w-[6px]
                            bg-white/45
                            hover:bg-white/75
                          `
                      }
                    `}
                  />
                );
              },
            )}
          </nav>

          {/* PREVIOUS */}

          <button
            type="button"
            onClick={goPrev}
            aria-label={t(
              "home.hero.previous_media",
            )}
            className="
              absolute
              left-5
              top-1/2
              z-20
              hidden
              h-11
              w-11
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/25
              bg-black/10
              text-white
              opacity-0
              backdrop-blur-sm
              transition-all
              duration-300
              hover:border-[#D2AA5A]/70
              hover:bg-black/25
              group-hover:opacity-100
              lg:flex
            "
          >
            <ChevronLeft
              className="
                h-[18px]
                w-[18px]
              "
              strokeWidth={1.7}
            />
          </button>

          {/* NEXT */}

          <button
            type="button"
            onClick={goNext}
            aria-label={t(
              "home.hero.next_image",
            )}
            className="
              absolute
              right-5
              top-1/2
              z-20
              hidden
              h-11
              w-11
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/25
              bg-black/10
              text-white
              opacity-0
              backdrop-blur-sm
              transition-all
              duration-300
              hover:border-[#D2AA5A]/70
              hover:bg-black/25
              group-hover:opacity-100
              lg:flex
            "
          >
            <ChevronRight
              className="
                h-[18px]
                w-[18px]
              "
              strokeWidth={1.7}
            />
          </button>
        </>
      )}
    </section>
  );
}