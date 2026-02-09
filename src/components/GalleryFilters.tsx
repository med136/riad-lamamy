"use client";

import { Filter } from "lucide-react";

const categories = [
  { id: "all", name: "Tout voir", count: 48 },
  { id: "architecture", name: "Architecture", count: 12 },
  { id: "chambres", name: "Chambres", count: 15 },
  { id: "jardin", name: "Jardin et piscine", count: 10 },
  { id: "restauration", name: "Restauration", count: 8 },
  { id: "spa", name: "Spa et bien-etre", count: 3 },
];

type GalleryFiltersProps = {
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
};

export default function GalleryFilters({
  selectedCategory,
  onSelect,
}: GalleryFiltersProps) {
  return (
    <div className="lux-panel rounded-3xl border border-amber-200/40 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-amber-700" />
          <div>
            <div className="lux-kicker text-amber-700/70">FILTRES</div>
            <span className="font-semibold text-gray-900">Affiner la galerie</span>
          </div>
        </div>
        <button
          onClick={() => onSelect("all")}
          className="text-amber-700 hover:text-amber-800 text-sm font-semibold"
        >
          Reinitialiser
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors border ${
              selectedCategory === category.id
                ? "bg-amber-700 text-white border-amber-700"
                : "bg-white/80 text-gray-800 border-amber-200/60 hover:border-amber-400"
            }`}
          >
            <span className="font-medium">{category.name}</span>
            <span
              className={`text-sm px-2 py-0.5 rounded-full ${
                selectedCategory === category.id
                  ? "bg-white/20 text-white"
                  : "bg-amber-50 text-gray-500"
              }`}
            >
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
