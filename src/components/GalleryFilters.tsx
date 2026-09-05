"use client";

import { Filter, RotateCcw } from "lucide-react";

const categories = [
  { id: "all", name: "Tout voir", count: 48 },
  { id: "architecture", name: "Architecture", count: 12 },
  { id: "chambres", name: "Chambres", count: 15 },
  { id: "jardin", name: "Jardin & patio", count: 10 },
  { id: "restauration", name: "La table", count: 8 },
  { id: "spa", name: "Bien-être", count: 3 },
];

type GalleryFiltersProps = {
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
};

export default function GalleryFilters({
  selectedCategory,
  onSelect,
}: GalleryFiltersProps) {
  const isDefault = selectedCategory === "all";

  return (
    <div className="mb-10">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          mb-5
          flex
          flex-col
          gap-4
          border-b
          border-[#B28A47]/15
          pb-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              mt-0.5
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[#B28A47]/20
              bg-[#F8F5EF]
            "
          >
            <Filter
              className="h-4 w-4 text-[#0F5A46]"
              strokeWidth={1.6}
            />
          </div>

          <div>
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-[#B28A47]
              "
            >
              Galerie
            </p>

            <h2
              className="
                mt-1
                font-serif
                text-[24px]
                font-medium
                leading-tight
                text-[#2B1C17]
                sm:text-[27px]
              "
            >
              Explorer les images
            </h2>

            <p
              className="
                mt-1
                text-[13px]
                leading-5
                text-[#6F625C]
              "
            >
              Parcourez Dar LaMamy selon l&apos;univers qui vous
              intéresse.
            </p>
          </div>
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={() => onSelect("all")}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              text-[12px]
              font-medium
              text-[#6F625C]
              transition-colors
              hover:text-[#0F5A46]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#B28A47]/50
              focus-visible:ring-offset-2
            "
          >
            <RotateCcw
              className="h-3.5 w-3.5"
              strokeWidth={1.6}
            />

            Réinitialiser
          </button>
        )}
      </div>

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <div
        className="
          flex
          flex-wrap
          gap-2
          sm:gap-2.5
        "
        role="group"
        aria-label="Filtrer la galerie"
      >
        {categories.map((category) => {
          const active =
            selectedCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                onSelect(category.id)
              }
              aria-pressed={active}
              className={`
                inline-flex
                min-h-[42px]
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-2
                text-[12px]
                font-medium
                transition-all
                duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#B28A47]/50
                focus-visible:ring-offset-2

                ${
                  active
                    ? `
                      border-[#0F5A46]
                      bg-[#0F5A46]
                      text-[#FFFDF8]
                      shadow-[0_8px_20px_-16px_rgba(15,90,70,0.5)]
                    `
                    : `
                      border-[#B28A47]/18
                      bg-[#FFFDF8]
                      text-[#5D514C]
                      hover:border-[#B28A47]/40
                      hover:bg-[#F8F5EF]
                      hover:text-[#2B1C17]
                    `
                }
              `}
            >
              <span>{category.name}</span>

              <span
                className={`
                  inline-flex
                  min-w-[22px]
                  items-center
                  justify-center
                  rounded-full
                  px-1.5
                  py-0.5
                  text-[10px]
                  leading-none

                  ${
                    active
                      ? `
                        bg-[#FFFDF8]/12
                        text-[#FFFDF8]/85
                      `
                      : `
                        bg-[#F8F5EF]
                        text-[#6F625C]/75
                      `
                  }
                `}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}