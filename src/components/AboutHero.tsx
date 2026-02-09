"use client";

import { motion } from "framer-motion";
import { Heart, Star, Award, Users } from "lucide-react";

export default function AboutHero() {
  return (
    <div className="relative h-[60vh] bg-gradient-to-r from-amber-900/80 to-amber-700/80">
      <div className="absolute inset-0 bg-[url('/images/about/hero-about.jpg')] bg-cover bg-center mix-blend-overlay"></div>
      <div className="relative h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white px-4"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Notre Histoire
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Trois générations de passion pour l&apos;art de vivre marocain
          </p>
        </motion.div>
      </div>
    </div>
  );
}
