"use client";

import { motion } from "framer-motion";
import { Compass, Camera, ShoppingBag, Sun, Clock } from "lucide-react";

const activities = [
  {
    icon: <Compass size={24} />,
    title: "Visite des souks",
    description: "Exploration guidee des marches traditionnels de Marrakech.",
    duration: "3h",
    price: "45 EUR",
  },
  {
    icon: <Camera size={24} />,
    title: "Safari photo",
    description: "Excursion dans la palmeraie avec photographe professionnel.",
    duration: "4h",
    price: "75 EUR",
  },
  {
    icon: <ShoppingBag size={24} />,
    title: "Shopping prive",
    description: "Accompagnement personnalise pour vos achats d'artisanat.",
    duration: "2h",
    price: "35 EUR",
  },
  {
    icon: <Sun size={24} />,
    title: "Coucher de soleil",
    description: "Excursion aux jardins de la Menara pour un moment magique.",
    duration: "2h",
    price: "30 EUR",
  },
];

export function Activities() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <div className="lux-kicker text-amber-700/80 mb-3">ACTIVITES</div>
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Activites et excursions
        </h3>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Decouvrez Marrakech avec nos experiences sur mesure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="lux-panel rounded-2xl p-8 border border-amber-200/50 shadow-lg"
          >
            <div className="text-amber-700 mb-4">{activity.icon}</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {activity.title}
            </h4>
            <p className="text-gray-600 mb-6">{activity.description}</p>

            <div className="flex justify-between items-center pt-4 border-t border-amber-100">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock size={16} className="text-amber-700" />
                {activity.duration}
              </div>
              <div className="text-lg font-bold text-amber-700">
                {activity.price}
              </div>
            </div>

            <button className="w-full mt-4 bg-amber-700 text-white py-2 rounded-xl hover:bg-amber-800 transition-colors">
              Reserver
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
