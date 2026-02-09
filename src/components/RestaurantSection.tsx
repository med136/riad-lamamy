"use client";

import { motion } from "framer-motion";
import { Utensils, Wine, Coffee, Star } from "lucide-react";

export function RestaurantSection() {
  const specialties = [
    {
      name: "Tajine d'agneau",
      description: "Aux pruneaux et amandes, cuisson lente traditionnelle.",
      price: "28 EUR",
    },
    {
      name: "Pastilla au pigeon",
      description: "Feuillete sucre-sale, specialite imperiale.",
      price: "32 EUR",
    },
    {
      name: "Couscous royal",
      description: "Sept legumes, viandes et bouillon parfume.",
      price: "35 EUR",
    },
  ];

  return (
    <div className="lux-panel rounded-3xl p-8 md:p-10 border border-amber-200/40 shadow-xl">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Utensils size={28} className="text-amber-700" />
        </div>
        <div>
          <div className="lux-kicker text-amber-700/80 mb-1">TABLE</div>
          <h3 className="text-2xl font-serif font-bold">
            Restaurant Dar Al Andalus
          </h3>
          <p className="text-gray-600">Gastronomie marocaine d'exception</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {specialties.map((dish, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 p-6 rounded-2xl border border-amber-200/50"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{dish.name}</h4>
                <p className="text-gray-600 text-sm">{dish.description}</p>
              </div>
              <div className="text-amber-700 font-bold text-xl">{dish.price}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50">
          <Wine size={20} className="text-amber-700 mx-auto mb-2" />
          <div className="text-gray-600 text-sm">Cave a vin</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50">
          <Coffee size={20} className="text-amber-700 mx-auto mb-2" />
          <div className="text-gray-600 text-sm">Terrasse</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50">
          <Star size={20} className="text-amber-700 mx-auto mb-2" />
          <div className="text-gray-600 text-sm">Chef etoile</div>
        </div>
      </div>
    </div>
  );
}
