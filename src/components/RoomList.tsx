"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Bed, Users, Maximize, Check, Wifi, Coffee, 
  Droplets, Wind, Tv, Shield, ArrowRight
} from "lucide-react";

const rooms = [
  {
    id: "standard",
    name: "Chambre Standard",
    description: "Confort et authenticité dans une chambre typiquement marocaine.",
    price: 120,
    size: 25,
    capacity: 2,
    features: [
      { icon: <Bed size={18} />, text: "Lit double 180x200" },
      { icon: <Users size={18} />, text: "2 personnes max" },
      { icon: <Maximize size={18} />, text: "25 m²" },
      { icon: <Wifi size={18} />, text: "Wi-Fi gratuit" },
      { icon: <Coffee size={18} />, text: "Petit-déjeuner inclus" },
      { icon: <Wind size={18} />, text: "Climatisation" },
    ],
    amenities: [
      "Salle de bain privée avec douche",
      "Produits de toilette bio",
      "Coffre-fort",
      "Sèche-cheveux",
      "Bureau",
      "Vue sur le patio",
    ],
  },
  {
    id: "deluxe",
    name: "Chambre Deluxe",
    description: "Espace et élégance avec terrasse privée et vue sur le jardin.",
    price: 180,
    size: 35,
    capacity: 2,
    popular: true,
    features: [
      { icon: <Bed size={18} />, text: "Lit king size 200x200" },
      { icon: <Users size={18} />, text: "2 personnes max" },
      { icon: <Maximize size={18} />, text: "35 m² + terrasse" },
      { icon: <Wifi size={18} />, text: "Wi-Fi haut débit" },
      { icon: <Coffee size={18} />, text: "Petit-déjeuner premium" },
      { icon: <Tv size={18} />, text: "TV écran plat" },
    ],
    amenities: [
      "Salle de bain en marbre",
      "Terrasse privée avec salon",
      "Mini-bar gratuit",
      "Service en chambre 24h/24",
      "Vue sur le jardin",
      "Plateau de bienvenue",
    ],
  },
  {
    id: "suite",
    name: "Suite Royale",
    description: "Luxe absolu avec salon séparé, jacuzzi et service VIP.",
    price: 250,
    size: 50,
    capacity: 3,
    luxury: true,
    features: [
      { icon: <Bed size={18} />, text: "Lit emperor 220x220" },
      { icon: <Users size={18} />, text: "3 personnes max" },
      { icon: <Maximize size={18} />, text: "50 m² + salon" },
      { icon: <Wifi size={18} />, text: "Wi-Fi fibre" },
      { icon: <Coffee size={18} />, text: "Petit-déjeuner gastronomique" },
      { icon: <Droplets size={18} />, text: "Jacuzzi privatif" },
    ],
    amenities: [
      "Salle de bain avec jacuzzi",
      "Salon privé séparé",
      "Service de majordome",
      "Accès VIP au spa",
      "Vue panoramique",
      "Champagne à l'arrivée",
    ],
  },
];

export function RoomList() {
  const [selectedRoom, setSelectedRoom] = useState("standard");

  const selectedRoomData = rooms.find(room => room.id === selectedRoom);

  return (
    <div className="mb-16">
      {/* Sélecteur de chambres */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        {rooms.map((room) => (
          <motion.button
            key={room.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRoom(room.id)}
            className={`flex-1 p-6 rounded-2xl text-left transition-all border border-amber-200/40 ${
              selectedRoom === room.id
                ? "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white shadow-2xl"
                : "lux-panel text-gray-800 hover:bg-amber-50 shadow-lg"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                <div className="text-2xl font-bold">
                  {room.price}€<span className="text-sm font-normal"> /nuit</span>
                </div>
              </div>
              {(room.popular || room.luxury) && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  room.luxury 
                    ? "bg-purple-500 text-white" 
                    : "bg-amber-500 text-white"
                }`}>
                  {room.luxury ? "LUXE" : "POPULAIRE"}
                </span>
              )}
            </div>
            <p className={`text-sm ${selectedRoom === room.id ? "text-amber-100" : "text-gray-600"}`}>
              {room.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Détails de la chambre sélectionnée */}
      {selectedRoomData && (
        <motion.div
          key={selectedRoom}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lux-panel rounded-3xl border border-amber-200/40 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image et caractéristiques */}
            <div className="p-8 lg:p-12">
              {/* Caractéristiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {selectedRoomData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-amber-700">{feature.icon}</div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Liste des équipements */}
              <div>
                <h4 className="text-xl font-bold mb-6">Équipements & Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRoomData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check size={18} className="text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé et CTA */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100 p-8 lg:p-12">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedRoomData.name}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {selectedRoomData.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-amber-200">
                      <span className="text-gray-600">Surface</span>
                      <span className="font-bold">{selectedRoomData.size} m²</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-amber-200">
                      <span className="text-gray-600">Capacité</span>
                      <span className="font-bold">{selectedRoomData.capacity} personne{selectedRoomData.capacity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-amber-200">
                      <span className="text-gray-600">Petit-déjeuner</span>
                      <span className="font-bold text-green-600">Inclus</span>
                    </div>
                  </div>
                </div>

                {/* Prix et réservation */}
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-amber-700 mb-2">
                      {selectedRoomData.price}€
                    </div>
                    <div className="text-gray-600">par nuit, taxes incluses</div>
                  </div>
                  
                  <Link href={`/chambres/${selectedRoomData.id}`}>
                    <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                      <span>Voir les détails</span>
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                  
                  <div className="text-center mt-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Shield size={16} />
                      <span>Annulation gratuite jusqu&apos;à 48h avant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
