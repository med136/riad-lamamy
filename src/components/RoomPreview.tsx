"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bed, Users, Heart, ArrowRight } from "lucide-react";

interface Room {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;
  images?: string[];
  popular?: boolean;
  luxury?: boolean;
}

export function RoomPreview() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (res.ok) {
        setRooms((data.rooms || []).slice(0, 3)); // Afficher seulement 3 chambres
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white via-amber-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-amber-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* En-tete */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="lux-kicker mb-3">CHAMBRES</div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gray-900">
              Nos Chambres d&apos;Exception
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque chambre est une invitation au voyage, alliant confort moderne 
              et authenticite marocaine.
            </p>
          </motion.div>
        </div>

        {/* Grille des chambres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {/* Carte de chambre */}
              <div className="lux-panel rounded-2xl border border-amber-200/40 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* En-tete de la carte */}
                <div className="relative h-64 overflow-hidden">
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {room.popular && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAIRE
                      </span>
                    )}
                    {room.luxury && (
                      <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        LUXE
                      </span>
                    )}
                  </div>
                  
                  {/* Bouton favori */}
                  <button
                    onClick={() => toggleFavorite(room.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      size={20} 
                      className={favorites.includes(room.id) ? "fill-red-500 text-red-500" : "text-gray-400"} 
                    />
                  </button>

                  {/* Image */}
                  <div className="relative h-full overflow-hidden bg-gradient-to-br from-amber-100 via-stone-50 to-amber-200">
                    {room.images && room.images.length > 0 ? (
                      <Image
                        src={room.images[0]}
                        alt={room.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={index === 0}
                        unoptimized
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23f7f0e6'/%3E%3C/svg%3E"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Bed size={48} className="text-amber-700/50 mx-auto mb-2" />
                          <span className="text-amber-700 font-semibold">Image: {room.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Titre */}
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>

                  {/* Caracteristiques */}
                  <div className="flex items-center space-x-6 text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span className="text-sm">{room.max_guests} personne{room.max_guests > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Prix et CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-700">
                        {room.base_price} EUR
                        <span className="text-sm text-gray-500 font-normal"> / nuit</span>
                      </div>
                      <div className="text-sm text-gray-500">Taxes incluses</div>
                    </div>
                    
                    <Link
                      href={`/chambres/${room.id}`}
                      className="btn-secondary group space-x-2 bg-white/80 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-white"
                    >
                      <span className="font-semibold">Details</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/chambres"
            className="btn-secondary group space-x-3 px-8 py-3 text-sm shadow-sm hover:bg-white"
          >
            <span>Voir toutes nos chambres et suites</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
