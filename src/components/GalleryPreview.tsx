"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";

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
    title: "Cour intérieure",
    category: "architecture",
    description:
      "Notre patio avec sa fontaine traditionnelle et ses détails fassis.",
  },
  {
    id: 2,
    title: "Suite raffinée",
    category: "chambres",
    description:
      "Une chambre où matières nobles et décoration marocaine se rencontrent.",
  },
  {
    id: 3,
    title: "Saveurs marocaines",
    category: "restauration",
    description:
      "Une cuisine généreuse inspirée des traditions familiales marocaines.",
  },
  {
    id: 4,
    title: "Un écrin de calme",
    category: "jardin",
    description:
      "Un espace paisible pensé pour ralentir et profiter pleinement du riad.",
  },
];

export function GalleryPreview() {
  const [items, setItems] =
    useState<GalleryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("all");

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    lightboxOpen,
    setLightboxOpen,
  ] = useState(false);

  /* =========================================================
     LOAD GALLERY
     ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const load = async () => {
      try {
        const res = await fetch(
          "/api/gallery?limit=12",
          {
            cache: "no-store",
            signal:
              controller.signal,
          },
        );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

        const next =
          Array.isArray(
            data?.items,
          )
            ? (data.items as GalleryItem[])
            : [];

        if (next.length) {
          setItems(next);
        }
      } catch (err) {
        if (
          (err as Error).name !==
          "AbortError"
        ) {
          console.error(
            "Gallery loading failed:",
            err,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  /* =========================================================
     DATA
     ========================================================= */

  const sourceImages =
    items.length
      ? items
      : fallbackImages;

  const categories =
    useMemo(() => {
      const unique =
        Array.from(
          new Set(
            sourceImages
              .map(
                (image) =>
                  image.category,
              )
              .filter(Boolean),
          ),
        );

      const labelFor = (
        value: string,
      ) =>
        value
          .charAt(0)
          .toUpperCase() +
        value.slice(1);

      return [
        {
          id: "all",
          name: "Toutes",
        },

        ...unique.map((id) => ({
          id,
          name: labelFor(id),
        })),
      ];
    }, [sourceImages]);

  const filteredImages =
    useMemo(() => {
      if (
        activeCategory ===
        "all"
      ) {
        return sourceImages;
      }

      return sourceImages.filter(
        (image) =>
          image.category ===
          activeCategory,
      );
    }, [
      activeCategory,
      sourceImages,
    ]);

  const activeImage =
    filteredImages[
      currentIndex
    ];

  /* =========================================================
     INDEX SAFETY
     ========================================================= */

  useEffect(() => {
    if (
      !filteredImages.length
    ) {
      setCurrentIndex(0);

      return;
    }

    if (
      currentIndex >=
      filteredImages.length
    ) {
      setCurrentIndex(0);
    }
  }, [
    currentIndex,
    filteredImages.length,
  ]);

  /* =========================================================
     LIGHTBOX BODY LOCK
     ========================================================= */

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [lightboxOpen]);

  /* =========================================================
     ESCAPE
     ========================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setLightboxOpen(false);
      }

      if (
        lightboxOpen &&
        event.key ===
          "ArrowRight"
      ) {
        nextSlide();
      }

      if (
        lightboxOpen &&
        event.key ===
          "ArrowLeft"
      ) {
        prevSlide();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  });

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const nextSlide = () => {
    if (
      !filteredImages.length
    ) {
      return;
    }

    setCurrentIndex(
      (previous) =>
        (previous + 1) %
        filteredImages.length,
    );
  };

  const prevSlide = () => {
    if (
      !filteredImages.length
    ) {
      return;
    }

    setCurrentIndex(
      (previous) =>
        (previous -
          1 +
          filteredImages.length) %
        filteredImages.length,
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]
        py-16
        sm:py-20
        lg:py-24
      "
    >
      {/* Background detail */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_10%_12%,rgba(178,138,71,0.06),transparent_34%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_92%_80%,rgba(15,90,70,0.045),transparent_36%)]
        "
        aria-hidden="true"
      />

      <div className="site-container relative">
        {/* ===================================================
            HEADER
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.55,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            mx-auto
            mb-10
            max-w-3xl
            text-center
            lg:mb-12
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <span
              className="
                h-px
                w-10
                bg-[#B28A47]/50
              "
            />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B28A47]
              "
            >
              Galerie
            </span>

            <span
              className="
                h-px
                w-10
                bg-[#B28A47]/50
              "
            />
          </div>

          <h2
            className="
              font-serif
              text-[2.5rem]
              font-medium
              leading-[1.05]
              tracking-[-0.025em]
              text-[#201A17]
              sm:text-[3rem]
              lg:text-[3.3rem]
            "
          >
            L&apos;âme de
            <span className="text-[#0F5A46]">
              {" "}
              Dar LaMamy
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-[15px]
              font-light
              leading-[1.75]
              text-gray-600
              sm:text-[16px]
            "
          >
            Découvrez les détails,
            les matières et les
            atmosphères qui donnent
            à notre maison son
            caractère unique.
          </p>
        </motion.div>

        {/* ===================================================
            CATEGORY FILTERS
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            mb-8
            flex
            flex-wrap
            justify-center
            gap-2
          "
        >
          {categories.map(
            (category) => {
              const active =
                activeCategory ===
                category.id;

              return (
                <button
                  key={
                    category.id
                  }
                  type="button"
                  onClick={() => {
                    setActiveCategory(
                      category.id,
                    );

                    setCurrentIndex(
                      0,
                    );
                  }}
                  className={`
                    rounded-full
                    border
                    px-5
                    py-2.5
                    text-[13px]
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          border-[#B28A47]/40
                          bg-[#0F5A46]
                          text-[#FFFDF8]
                          shadow-[0_7px_20px_rgba(15,90,70,0.16)]
                        `
                        : `
                          border-[#B28A47]/20
                          bg-white/70
                          text-gray-600
                          hover:border-[#B28A47]/40
                          hover:bg-[#B28A47]/5
                          hover:text-[#0F5A46]
                        `
                    }
                  `}
                >
                  {
                    category.name
                  }
                </button>
              );
            },
          )}
        </motion.div>

        {/* ===================================================
            LOADING
            =================================================== */}

        {loading ? (
          <div
            className="
              mx-auto
              max-w-6xl
              overflow-hidden
              rounded-[28px]
              border
              border-[#B28A47]/15
              bg-white/70
              p-4
              shadow-sm
            "
          >
            <div className="animate-pulse">
              <div
                className="
                  h-[500px]
                  w-full
                  rounded-[22px]
                  bg-[#B28A47]/10
                "
              />
            </div>
          </div>
        ) : filteredImages.length ===
          0 ? (
          /* =================================================
             EMPTY
             ================================================= */

          <div
            className="
              mx-auto
              max-w-4xl
              rounded-[28px]
              border
              border-[#B28A47]/15
              bg-white/70
              p-10
              text-center
              shadow-sm
            "
          >
            <p
              className="
                font-serif
                text-xl
                font-medium
                text-[#201A17]
              "
            >
              Aucune image à
              afficher
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Ajoutez des photos
              depuis
              l&apos;administration
              de la galerie.
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                FEATURED IMAGE
                ================================================= */}

            <div
              className="
                relative
                mx-auto
                mb-7
                max-w-6xl
              "
            >
              <motion.div
                key={
                  activeImage?.id
                }
                initial={{
                  opacity: 0,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="
                  group/gallery
                  relative
                  h-[420px]
                  overflow-hidden
                  rounded-[30px]

                  border
                  border-[#B28A47]/20

                  bg-[#F3EFE7]

                  shadow-[0_28px_75px_-50px_rgba(35,20,12,0.45)]

                  sm:h-[500px]
                  lg:h-[560px]
                "
              >
                {activeImage?.image_url ? (
                  <>
                    <Image
                      src={
                        activeImage.image_url
                      }
                      alt={
                        activeImage.title ||
                        "Dar LaMamy"
                      }
                      fill
                      sizes="
                        (max-width: 768px) 100vw,
                        1200px
                      "
                      className="
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover/gallery:scale-[1.015]
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/70
                        via-black/10
                        to-black/5
                      "
                    />
                  </>
                ) : (
                  <>
                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-[#F6F1E8]
                        via-[#FFFDF8]
                        to-[#E5D2A7]/45
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-[radial-gradient(circle_at_72%_22%,rgba(15,90,70,0.09),transparent_38%)]
                      "
                    />
                  </>
                )}

                {/* Caption */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    z-10
                    p-5
                    sm:p-7
                    lg:p-9
                  "
                >
                  <div
                    className="
                      max-w-xl
                      rounded-[22px]

                      border
                      border-white/15

                      bg-black/20

                      px-5
                      py-4

                      text-white

                      shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)]

                      backdrop-blur-md

                      sm:px-6
                      sm:py-5
                    "
                  >
                    <p
                      className="
                        mb-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.27em]
                        text-[#E8C982]
                      "
                    >
                      {
                        activeImage
                          ?.category
                      }
                    </p>

                    <h3
                      className="
                        font-serif
                        text-[28px]
                        font-medium
                        leading-tight
                        text-[#FFFDF8]
                        sm:text-[32px]
                      "
                    >
                      {
                        activeImage
                          ?.title
                      }
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-lg
                        text-sm
                        font-light
                        leading-[1.65]
                        text-white/75
                        sm:text-[15px]
                      "
                    >
                      {activeImage
                        ?.description ||
                        "Une vue de notre maison d’hôtes, entre tradition et élégance."}
                    </p>
                  </div>
                </div>

                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Image précédente"
                  className="
                    absolute
                    left-4
                    top-1/2
                    z-20
                    inline-flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-white/20

                    bg-black/20

                    text-white

                    backdrop-blur-md

                    transition-all
                    duration-200

                    hover:bg-white
                    hover:text-[#0F5A46]

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#D2AA5A]
                  "
                >
                  <ChevronLeft
                    size={20}
                    strokeWidth={1.7}
                  />
                </button>

                {/* NEXT */}

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Image suivante"
                  className="
                    absolute
                    right-4
                    top-1/2
                    z-20
                    inline-flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-white/20

                    bg-black/20

                    text-white

                    backdrop-blur-md

                    transition-all
                    duration-200

                    hover:bg-white
                    hover:text-[#0F5A46]

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#D2AA5A]
                  "
                >
                  <ChevronRight
                    size={20}
                    strokeWidth={1.7}
                  />
                </button>

                {/* FULLSCREEN */}

                {activeImage
                  ?.image_url && (
                  <button
                    onClick={() =>
                      setLightboxOpen(
                        true,
                      )
                    }
                    className="
                      absolute
                      right-5
                      top-5
                      z-20

                      inline-flex
                      h-10
                      items-center
                      gap-2
                      rounded-full

                      border
                      border-white/20

                      bg-black/20

                      px-4

                      text-xs
                      font-semibold
                      text-white

                      backdrop-blur-md

                      transition-colors

                      hover:bg-white
                      hover:text-[#0F5A46]
                    "
                    type="button"
                  >
                    <Maximize2
                      size={15}
                      strokeWidth={1.7}
                    />

                    <span className="hidden sm:inline">
                      Voir en grand
                    </span>
                  </button>
                )}
              </motion.div>

              {/* =================================================
                  INDICATORS
                  ================================================= */}

              <div
                className="
                  mt-5
                  flex
                  justify-center
                  gap-2
                "
              >
                {filteredImages.map(
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          index,
                        )
                      }
                      aria-label={`Aller à l'image ${
                        index + 1
                      }`}
                      className={`
                        h-[5px]
                        rounded-full
                        transition-all
                        duration-200

                        ${
                          index ===
                          currentIndex
                            ? "w-8 bg-[#0F5A46]"
                            : "w-[5px] bg-[#B28A47]/30 hover:bg-[#B28A47]/60"
                        }
                      `}
                    />
                  ),
                )}
              </div>
            </div>

            {/* =================================================
                THUMBNAILS
                ================================================= */}

            <div
              className="
                mx-auto
                mb-10
                grid
                max-w-6xl
                grid-cols-2
                gap-3
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-6
              "
            >
              {filteredImages.map(
                (
                  image,
                  index,
                ) => {
                  const active =
                    index ===
                    currentIndex;

                  return (
                    <motion.button
                      key={
                        image.id
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.4,
                        delay:
                          index *
                          0.03,
                      }}
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          index,
                        )
                      }
                      className={`
                        relative
                        aspect-[4/3]
                        overflow-hidden
                        rounded-[16px]

                        border

                        transition-all
                        duration-200

                        ${
                          active
                            ? `
                              border-[#B28A47]/70
                              shadow-[0_6px_20px_rgba(178,138,71,0.18)]
                              ring-2
                              ring-[#B28A47]/30
                              ring-offset-2
                              ring-offset-[#FFFDF8]
                            `
                            : `
                              border-[#B28A47]/10
                              opacity-70
                              hover:border-[#B28A47]/30
                              hover:opacity-100
                            `
                        }
                      `}
                    >
                      {image.image_url ? (
                        <Image
                          src={
                            image.image_url
                          }
                          alt={
                            image.title
                          }
                          fill
                          sizes="200px"
                          className="
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-gradient-to-br
                            from-[#F6F1E8]
                            to-[#E8D7B4]
                          "
                        >
                          <span
                            className="
                              px-2
                              text-center
                              text-xs
                              font-semibold
                              text-[#0F5A46]
                            "
                          >
                            {
                              image.title
                            }
                          </span>
                        </div>
                      )}

                      {active && (
                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            border-2
                            border-[#FFFDF8]/70
                          "
                        />
                      )}
                    </motion.button>
                  );
                },
              )}
            </div>
          </>
        )}

        {/* ===================================================
            CTA
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-center"
        >
          <Link
            href="/galerie"
            className="
              group
              inline-flex
              h-[52px]
              items-center
              justify-center
              gap-3
              rounded-full

              border
              border-[#B28A47]/35

              bg-[#0F5A46]

              px-8

              text-[14px]
              font-semibold
              text-[#FFFDF8]

              shadow-[0_9px_25px_rgba(15,90,70,0.18)]

              transition-all
              duration-200

              hover:-translate-y-px
              hover:bg-[#12604B]
              hover:shadow-[0_12px_30px_rgba(15,90,70,0.24)]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#B28A47]/60
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[#FFFDF8]
            "
          >
            <span>
              Explorer toute la
              galerie
            </span>

            <ArrowRight
              size={17}
              strokeWidth={1.7}
              className="
                text-[#D2AA5A]
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>

        {/* ===================================================
            LIGHTBOX
            =================================================== */}

        {lightboxOpen &&
          activeImage?.image_url && (
            <div
              className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/90
                p-4
                backdrop-blur-sm
              "
              role="dialog"
              aria-modal="true"
              aria-label="Aperçu de l'image"
              onClick={() =>
                setLightboxOpen(
                  false,
                )
              }
            >
              <div
                className="
                  relative
                  flex
                  max-h-[92vh]
                  w-full
                  max-w-6xl
                  flex-col
                  overflow-hidden
                  rounded-[24px]
                  bg-[#111]
                  shadow-2xl
                "
                onClick={(
                  event,
                ) =>
                  event.stopPropagation()
                }
              >
                {/* Close */}

                <button
                  type="button"
                  onClick={() =>
                    setLightboxOpen(
                      false,
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-4
                    z-30
                    inline-flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/35
                    text-white
                    backdrop-blur-md
                    transition-colors
                    hover:bg-white
                    hover:text-[#0F5A46]
                  "
                  aria-label="Fermer"
                >
                  <X
                    size={18}
                  />
                </button>

                {/* Image */}

                <div
                  className="
                    relative
                    h-[65vh]
                    min-h-[360px]
                    w-full
                    bg-black
                  "
                >
                  <Image
                    src={
                      activeImage.image_url
                    }
                    alt={
                      activeImage.title
                    }
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />

                  {/* prev */}

                  <button
                    type="button"
                    onClick={
                      prevSlide
                    }
                    className="
                      absolute
                      left-4
                      top-1/2
                      z-20
                      inline-flex
                      h-11
                      w-11
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/20
                      bg-black/30
                      text-white
                      backdrop-blur
                      hover:bg-white
                      hover:text-[#0F5A46]
                    "
                    aria-label="Image précédente"
                  >
                    <ChevronLeft
                      size={20}
                    />
                  </button>

                  {/* next */}

                  <button
                    type="button"
                    onClick={
                      nextSlide
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      z-20
                      inline-flex
                      h-11
                      w-11
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/20
                      bg-black/30
                      text-white
                      backdrop-blur
                      hover:bg-white
                      hover:text-[#0F5A46]
                    "
                    aria-label="Image suivante"
                  >
                    <ChevronRight
                      size={20}
                    />
                  </button>
                </div>

                {/* Caption */}

                <div
                  className="
                    border-t
                    border-white/10
                    bg-[#FFFDF8]
                    px-6
                    py-5
                    text-center
                  "
                >
                  <p
                    className="
                      mb-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.25em]
                      text-[#B28A47]
                    "
                  >
                    {
                      activeImage.category
                    }
                  </p>

                  <h3
                    className="
                      font-serif
                      text-2xl
                      font-medium
                      text-[#201A17]
                    "
                  >
                    {
                      activeImage.title
                    }
                  </h3>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-2xl
                      text-sm
                      leading-relaxed
                      text-gray-500
                    "
                  >
                    {activeImage.description ||
                      "Une vue de notre maison d’hôtes, entre tradition et élégance."}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}