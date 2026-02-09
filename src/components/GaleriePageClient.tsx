"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import GalleryFilters from "@/components/GalleryFilters";

export default function GaleriePageClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="container mx-auto px-4">
      <GalleryFilters
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <Gallery selectedCategory={selectedCategory} />
    </div>
  );
}
