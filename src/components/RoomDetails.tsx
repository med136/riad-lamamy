"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bed, Bath, Tv, Wifi, Coffee, Wind,
  Users, Maximize, Shield, Heart
} from "lucide-react";

const roomDetails = {
  standard: {
    amenities: [
      { icon: <Bed size={20} />, text: "Lit double 180x200" },
      { icon: <Bath size={20} />, text: "Salle de bain privée" },
      { icon: <Wifi size={20} />, text: "Wi-Fi gratuit" },
      { icon: <Coffee size={20} />, text: "Thé/Café" },
      { icon: <Tv size={20} />, text: "TV écran plat" },
      { icon: <Wind size={20} />, text: "Climatisation" },
    ],
    included: [
      "Petit-déjeuner marocain",
      "Service de ménage quotidien",
      "Produits de toilette bio",
      "Coffre-fort",
      "Sèche-cheveux",
    ],
  },
  deluxe: {
    amenities: [
      { icon: <Bed size={20} />, text: "Lit king size 200x200" },
      { icon: <Bath size={20} />, text: "Salle de bain en marbre" },
      { icon: <Wifi size={20} />, text: "Wi-Fi fibre" },
      { icon: <Coffee size={20} />, text: "Machine à café" },
      { icon: <Users size={20} />, text: "Terrasse privée" },
      { icon: <Maximize size={20} />, text: "35m² + terrasse" },
    ],
    included: [
      "Tous les services Standard",
      "Service en chambre 24h/24",
      "Mini-bar gratuit",
      "Plateau de bienvenue",
      "Vue sur le jardin",
    ],
  },
  suite: {
    amenities: [
      { icon: <Bed size={20} />, text: "Lit emperor 220x220" },
      { icon: <Bath size={20} />, text: "Salle de bain avec jacuzzi" },
      { icon: <Wifi size={20} />, text: "Wi-Fi ultra-rapide" },
      { icon: <Coffee size={20} />, text: "Bar privé" },
      { icon: <Users size={20} />, text: "Salon séparé" },
      { icon: <Heart size={20} />, text: "Service majordome" },
    ],
    included: [
      "Tous les services Deluxe",
      "Champagne à l'arrivée",
      "Accès VIP au spa",
      "Parking privé",
      "Transfert aéroport",
    ],
  },
};

export default function RoomDetails() {
  const [selectedRoom, setSelectedRoom] = useState<keyof typeof roomDetails>("standard");

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
          Détails des Chambres
        </h3>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tout le confort dont vous avez besoin pour un séjour parfait
        </p>
      </div>

      {/* Sélecteur de chambre */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-2xl bg-gray-100 p-2">
          {Object.keys(roomDetails).map((roomType) => (
            <button
              key={roomType}
              onClick={() => setSelectedRoom(roomType as keyof typeof roomDetails)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedRoom === roomType
                  ? "bg-white text-amber-700 shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Détails de la chambre sélectionnée */}
      <motion.div
        key={selectedRoom}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
      >
        {/* Équipements */}
        <div className="lux-panel rounded-3xl p-8 border border-amber-200/40 shadow-2xl">
          <h4 className="text-2xl font-bold mb-6">Équipements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roomDetails[selectedRoom].amenities.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="text-amber-700">{item.icon}</div>
                <span className="text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services inclus */}
        <div className="lux-panel rounded-3xl p-8 border border-amber-200/40 shadow-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100">
          <h4 className="text-2xl font-bold mb-6">Services Inclus</h4>
          <ul className="space-y-4">
            {roomDetails[selectedRoom].included.map((service, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Shield size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{service}</span>
              </li>
            ))}
          </ul>

          {/* Note */}
          <div className="mt-8 pt-6 border-t border-amber-200">
            <p className="text-amber-700">
              <span className="font-bold">Note:</span> Tous nos services sont 
              inclus dans le prix. Pas de frais cachés.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
