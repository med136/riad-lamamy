"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Sparkles, Globe } from "lucide-react";

const values = [
  {
    icon: <Heart size={28} />,
    title: "Authenticite",
    description: "Preservation des traditions marocaines dans chaque detail.",
  },
  {
    icon: <Shield size={28} />,
    title: "Confiance",
    description: "Relations transparentes et engagements tenus.",
  },
  {
    icon: <Sparkles size={28} />,
    title: "Excellence",
    description: "Recherche constante de la perfection dans nos services.",
  },
  {
    icon: <Globe size={28} />,
    title: "Durabilite",
    description: "Engagement ecologique et soutien a l'artisanat local.",
  },
];

export default function Values() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <div className="lux-kicker text-amber-700/80 mb-3">VALEURS</div>
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Nos valeurs
        </h3>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Les principes qui guident chacune de nos actions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="lux-panel rounded-2xl p-8 border border-amber-200/50 shadow-lg"
          >
            <div className="text-amber-700 mb-4">{value.icon}</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {value.title}
            </h4>
            <p className="text-gray-600">{value.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
