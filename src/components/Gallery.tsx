"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
} from "lucide-react";

type GalleryImage = {
  id: number;
  category: string;
  title: string;
  src: string;
  featured?: boolean;
};

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    category: "architecture",
    title: "Architecture traditionnelle",
    src: "/images/gallery/gallery-01.jpeg",
    featured: true,
  },
  {
    id: 2,
    category: "chambres",
    title: "Une chambre de Dar LaMamy",
    src: "/images/gallery/gallery-02.jpeg",
  },
  {
    id: 3,
    category: "jardin",
    title: "Le patio",
    src: "/images/gallery/gallery-03.jpeg",
    featured: true,
  },
  {
    id: 4,
    category: "restauration",
    title: "Un moment à table",
    src: "/images/gallery/gallery-04.jpeg",
  },
  {
    id: 5,
    category: "architecture",
    title: "Détails du riad",
    src: "/images/gallery/gallery-05.jpeg",
  },
  {
    id: 6,
    category: "chambres",
    title: "Atmosphère des chambres",
    src: "/images/gallery/gallery-06.jpeg",
  },
  {
    id: 7,
    category: "spa",
    title: "Un moment de bien-être",
    src: "/images/gallery/gallery-07.jpeg",
  },
  {
    id: 8,
    category: "jardin",
    title: "Lumière du patio",
    src: "/images/gallery/gallery-08.jpeg",
    featured: true,
  },
  {
    id: 9,
    category: "architecture",
    title: "Zellige & artisanat",
    src: "/images/gallery/gallery-09.jpeg",
  },
  {
    id: 10,
    category: "restauration",
    title: "Petit-déjeuner marocain",
    src: "/images/gallery/gallery-10.jpeg",
  },
  {
    id: 11,
    category: "spa",
    title: "Détente à Dar LaMamy",
    src: "/images/gallery/gallery-11.jpeg",
  },
  {
    id: 12,
    category: "chambres",
    title: "Détails de chambre",
    src: "/images/gallery/gallery-12.jpeg",
  },
];

type GalleryProps = {
  selectedCategory: string;
};

function formatCategory(category: string) {
  switch (category) {
    case "architecture":
      return "Architecture";
    case "chambres":
      return "Chambres";
    case "jardin":
      return "Patio & extérieur";
    case "restauration":
      return "La table";
    case "spa":
      return "Bien-être";
    default:
      return category;
  }
}

export default function Gallery({
  selectedCategory,
}: GalleryProps) {
  const [selectedImage, setSelectedImage] =
    useState<number | null>(null);

  const [favorites, setFavorites] =
    useState<number[]>([]);

  const filteredImages = useMemo(
    () =>
      selectedCategory === "all"
        ? galleryImages
        : galleryImages.filter(
            (image) =>
              image.category === selectedCategory,
          ),
    [selectedCategory],
  );

  const selectedImageIndex =
    selectedImage !== null
      ? filteredImages.findIndex(
          (image) =>
            image.id === selectedImage,
        )
      : -1;

  const selectedImageData =
    selectedImageIndex >= 0
      ? filteredImages[
          selectedImageIndex
        ]
      : null;

  const nextImage = () => {
    if (
      selectedImageIndex <
      filteredImages.length - 1
    ) {
      setSelectedImage(
        filteredImages[
          selectedImageIndex + 1
        ].id,
      );
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImage(
        filteredImages[
          selectedImageIndex - 1
        ].id,
      );
    }
  };

  const toggleFavorite = (
    id: number | null,
  ) => {
    if (!id) return;

    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter(
            (favorite) =>
              favorite !== id,
          )
        : [...prev, id],
    );
  };

  useEffect(() => {
    if (!selectedImage) return;

    const exists =
      filteredImages.some(
        (image) =>
          image.id === selectedImage,
      );

    if (!exists) {
      setSelectedImage(null);
    }
  }, [
    selectedCategory,
    selectedImage,
    filteredImages,
  ]);

  /* clavier lightbox */

  useEffect(() => {
    if (selectedImage === null) {
      return;
    }

    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        nextImage();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        prevImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
  }, [
    selectedImage,
    selectedImageIndex,
  ]);

  return (
    <div>
      {/* =====================================================
          GALLERY HEADER
          ===================================================== */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-3
          border-b
          border-[#B28A47]/15
          pb-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.26em]
              text-[#B28A47]
            "
          >
            Collection
          </p>

          <h2
            className="
              mt-1
              font-serif
              text-[27px]
              font-medium
              text-[#2B1C17]
              sm:text-[30px]
            "
          >
            Galerie Dar LaMamy
          </h2>

          <p
            className="
              mt-1
              text-[13px]
              text-[#6F625C]
            "
          >
            {filteredImages.length}{" "}
            photo
            {filteredImages.length > 1
              ? "s"
              : ""}
          </p>
        </div>

        {selectedCategory !==
          "all" && (
          <div
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#0F5A46]
            "
          >
            {formatCategory(
              selectedCategory,
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          PHOTO GRID
          ===================================================== */}

      {filteredImages.length > 0 ? (
        <motion.div
          layout
          className="
            grid
            auto-flow-dense
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map(
              (image, index) => {
                const isFavorite =
                  favorites.includes(
                    image.id,
                  );

                const large =
                  image.featured &&
                  selectedCategory ===
                    "all";

                return (
                  <motion.article
                    layout
                    key={image.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.3,
                      delay:
                        index * 0.025,
                    }}
                    className={`
                      group
                      relative
                      cursor-pointer
                      overflow-hidden
                      rounded-[18px]
                      bg-[#F8F5EF]

                      ${
                        large
                          ? "sm:col-span-2 sm:row-span-2"
                          : ""
                      }
                    `}
                    onClick={() =>
                      setSelectedImage(
                        image.id,
                      )
                    }
                  >
                    <div
                      className={`
                        relative
                        ${
                          large
                            ? "aspect-[4/3] sm:h-full sm:min-h-[520px]"
                            : "aspect-[4/3]"
                        }
                      `}
                    >
                      <Image
                        src={image.src}
                        alt={image.title}
                        fill
                        sizes={
                          large
                            ? "(max-width: 640px) 100vw, (max-width: 1280px) 66vw, 50vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        }
                        className="
                          object-cover
                          transition-transform
                          duration-700
                          ease-out
                          group-hover:scale-[1.025]
                        "
                      />

                      {/* soft bottom overlay */}

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-[#1C1714]/55
                          via-transparent
                          to-transparent
                          opacity-70
                          transition-opacity
                          duration-300
                          group-hover:opacity-90
                        "
                      />

                      {/* category */}

                      <div
                        className="
                          absolute
                          left-4
                          top-4
                        "
                      >
                        <span
                          className="
                            rounded-full
                            border
                            border-white/25
                            bg-black/10
                            px-3
                            py-1.5
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-white
                            backdrop-blur-sm
                          "
                        >
                          {formatCategory(
                            image.category,
                          )}
                        </span>
                      </div>

                      {/* favorite */}

                      <button
                        type="button"
                        aria-label={
                          isFavorite
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation();

                          toggleFavorite(
                            image.id,
                          );
                        }}
                        className="
                          absolute
                          right-4
                          top-4
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/20
                          bg-black/10
                          text-white
                          backdrop-blur-sm
                          transition
                          hover:bg-white
                          hover:text-[#0F5A46]
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-white
                        "
                      >
                        <Heart
                          className={`
                            h-4
                            w-4

                            ${
                              isFavorite
                                ? "fill-[#D2AA5A] text-[#D2AA5A]"
                                : ""
                            }
                          `}
                          strokeWidth={
                            1.6
                          }
                        />
                      </button>

                      {/* title */}

                      <div
                        className="
                          absolute
                          bottom-0
                          left-0
                          right-0
                          p-4
                          sm:p-5
                        "
                      >
                        <h3
                          className="
                            font-serif
                            text-[21px]
                            font-medium
                            leading-tight
                            text-white
                            sm:text-[23px]
                          "
                        >
                          {image.title}
                        </h3>

                        <div
                          className="
                            mt-2
                            h-px
                            w-8
                            bg-[#D2AA5A]
                            transition-all
                            duration-300
                            group-hover:w-14
                          "
                        />
                      </div>
                    </div>
                  </motion.article>
                );
              },
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div
          className="
            rounded-[20px]
            border
            border-[#B28A47]/15
            bg-[#FFFDF8]
            px-6
            py-12
            text-center
          "
        >
          <p
            className="
              font-serif
              text-[24px]
              font-medium
              text-[#2B1C17]
            "
          >
            Aucune photo dans cette
            catégorie.
          </p>

          <p
            className="
              mt-2
              text-sm
              text-[#6F625C]
            "
          >
            D&apos;autres images
            seront ajoutées
            prochainement.
          </p>
        </div>
      )}

      {/* =====================================================
          LIGHTBOX
          ===================================================== */}

      <AnimatePresence>
        {selectedImageData && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={
              selectedImageData.title
            }
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-[#171411]/95
              p-3
              sm:p-6
            "
            onClick={() =>
              setSelectedImage(null)
            }
          >
            <div
              className="
                relative
                flex
                h-full
                max-h-[900px]
                w-full
                max-w-[1400px]
                flex-col
                overflow-hidden
                rounded-[18px]
                bg-[#1D1916]
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* image */}

              <div className="relative min-h-0 flex-1">
                <Image
                  src={
                    selectedImageData.src
                  }
                  alt={
                    selectedImageData.title
                  }
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />

                {/* close */}

                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() =>
                    setSelectedImage(null)
                  }
                  className="
                    absolute
                    right-4
                    top-4
                    z-10
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/20
                    text-white
                    backdrop-blur-sm
                    transition
                    hover:bg-white
                    hover:text-[#2B1C17]
                  "
                >
                  <X
                    className="h-5 w-5"
                    strokeWidth={1.5}
                  />
                </button>

                {/* previous */}

                {selectedImageIndex >
                  0 && (
                  <button
                    type="button"
                    aria-label="Photo précédente"
                    onClick={
                      prevImage
                    }
                    className="
                      absolute
                      left-3
                      top-1/2
                      z-10
                      flex
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
                      backdrop-blur-sm
                      transition
                      hover:bg-white
                      hover:text-[#2B1C17]
                      sm:left-5
                    "
                  >
                    <ChevronLeft
                      className="h-5 w-5"
                      strokeWidth={
                        1.5
                      }
                    />
                  </button>
                )}

                {/* next */}

                {selectedImageIndex <
                  filteredImages.length -
                    1 && (
                  <button
                    type="button"
                    aria-label="Photo suivante"
                    onClick={
                      nextImage
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      z-10
                      flex
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
                      backdrop-blur-sm
                      transition
                      hover:bg-white
                      hover:text-[#2B1C17]
                      sm:right-5
                    "
                  >
                    <ChevronRight
                      className="h-5 w-5"
                      strokeWidth={
                        1.5
                      }
                    />
                  </button>
                )}
              </div>

              {/* footer */}

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  border-t
                  border-white/10
                  bg-[#1D1916]
                  px-5
                  py-4
                  text-white
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-6
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.20em]
                      text-[#D2AA5A]
                    "
                  >
                    {formatCategory(
                      selectedImageData.category,
                    )}
                  </p>

                  <h3
                    className="
                      mt-1
                      font-serif
                      text-[22px]
                      font-medium
                      sm:text-[25px]
                    "
                  >
                    {
                      selectedImageData.title
                    }
                  </h3>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <span
                    className="
                      text-[11px]
                      text-white/60
                    "
                  >
                    {selectedImageIndex +
                      1}
                    {" / "}
                    {
                      filteredImages.length
                    }
                  </span>

                  <button
                    type="button"
                    aria-label="Ajouter aux favoris"
                    onClick={() =>
                      toggleFavorite(
                        selectedImageData.id,
                      )
                    }
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/15
                      text-white/80
                      transition
                      hover:border-[#D2AA5A]/50
                      hover:text-[#D2AA5A]
                    "
                  >
                    <Heart
                      className={`
                        h-4
                        w-4

                        ${
                          favorites.includes(
                            selectedImageData.id,
                          )
                            ? "fill-[#D2AA5A] text-[#D2AA5A]"
                            : ""
                        }
                      `}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}