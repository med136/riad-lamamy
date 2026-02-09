"use client";

import { motion } from "framer-motion";
import { Droplets, Heart } from "lucide-react";

export function SpaSection() {
  const treatments = [
    {
      name: "Hammam traditionnel",
      duration: "60 min",
      price: "45 EUR",
      description: "Rituel de purification et relaxation profonde.",
    },
    {
      name: "Massage aux huiles bio",
      duration: "90 min",
      price: "75 EUR",
      description: "Massage therapeutique aux huiles essentielles.",
    },
    {
      name: "Soin du visage",
      duration: "45 min",
      price: "55 EUR",
      description: "Soin revitalisant aux produits naturels marocains.",
    },
  ];

  return (
    <div className="lux-panel rounded-3xl p-8 md:p-10 border border-amber-200/40 shadow-xl">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Droplets size={28} className="text-amber-700" />
        </div>
        <div>
          <div className="lux-kicker text-amber-700/80 mb-1">SPA</div>
          <h3 className="text-2xl font-serif font-bold">Spa et bien-etre</h3>
          <p className="text-gray-600">Oasis de detente au coeur du riad</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {treatments.map((treatment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 p-6 rounded-2xl border border-amber-200/50"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg text-gray-900">
                  {treatment.name}
                </h4>
                <p className="text-gray-600 text-sm">{treatment.description}</p>
              </div>
              <div className="text-right">
                <div className="text-amber-700 font-bold text-xl">
                  {treatment.price}
                </div>
                <div className="text-gray-500 text-sm">{treatment.duration}</div>
              </div>
            </div>
            <button className="w-full bg-amber-700 text-white py-2 rounded-xl hover:bg-amber-800 transition-colors">
              Reserver ce soin
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50">
          <div className="text-amber-700 font-bold">100%</div>
          <div className="text-gray-600 text-sm">Naturel</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50">
          <div className="text-amber-700 font-bold">24/7</div>
          <div className="text-gray-600 text-sm">Disponible</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center text-sm text-amber-700">
        <Heart size={16} className="mr-2" />
        Massage sur demande - reservation requise
      </div>
    </div>
  );
}
