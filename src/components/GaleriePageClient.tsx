"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import GalleryFilters from "@/components/GalleryFilters";

export default function GaleriePageClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="site-container">
      <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">
          Explorer
        </p>

        <div className="mx-auto mt-3 flex w-[110px] items-center" aria-hidden="true">
          <span className="h-px flex-1 bg-[#B28A47]/40" />
          <span className="mx-3 h-[6px] w-[6px] rotate-45 border border-[#B28A47]" />
          <span className="h-px flex-1 bg-[#B28A47]/40" />
        </div>

        <h2 className="mt-5 font-serif text-[30px] font-medium leading-tight text-[#2B1C17] sm:text-[36px]">
          Découvrez Dar LaMamy
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
          Parcourez les espaces, les chambres et les détails qui donnent à la maison son caractère.
        </p>
      </div>

      <div className="mb-7 sm:mb-9">
        <GalleryFilters
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <Gallery selectedCategory={selectedCategory} />
    </div>
  );
}
