"use client";

import { motion } from "framer-motion";
import { Heart, Star, Award, Users } from "lucide-react";
import Link from "next/link";

export function AboutPreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-stone-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="lux-kicker">NOTRE HISTOIRE</span>
              <span className="h-px w-10 bg-amber-400/70" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-gray-900">
              Plus qu&apos;un riad,<br />
              <span className="text-amber-700">une passion familiale</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Depuis trois générations, notre famille s&apos;attache à préserver 
              l&apos;ame de cette demeure historique tout en y apportant 
              le confort moderne. Chaque détail raconte une histoire, 
              chaque pièce respire l&apos;authenticité marocaine.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: <Star />, value: "15 ans", label: "d&apos;expérience" },
                { icon: <Award />, value: "12", label: "chambres uniques" },
                { icon: <Users />, value: "5000+", label: "clients heureux" },
                { icon: <Heart />, value: "98%", label: "satisfaction" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <Link
              href="/a-propos"
              className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold group"
            >
              <span>Découvrir notre histoire</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </motion.div>

          {/* Image/Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="lux-frame aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 via-white to-amber-200">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,87,71,0.15),transparent_45%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(217,119,6,0.18),transparent_50%)]" />
              <div className="absolute inset-0 flex items-end p-8">
                <div className="lux-panel rounded-2xl px-5 py-4">
                  <p className="lux-kicker mb-2 text-amber-800">MAISON D'HOTES</p>
                  <h3 className="text-2xl font-serif font-bold text-amber-950">
                    Notre Maison
                  </h3>
                  <p className="text-amber-900/80 text-sm">
                    Une histoire de famille depuis 1908
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
