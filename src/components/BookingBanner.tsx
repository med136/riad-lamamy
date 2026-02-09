"use client";

import { Calendar, Shield, Star } from "lucide-react";
import Link from "next/link";

export function BookingBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white py-14">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Texte */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">
              Prêt pour l&apos;expérience ?
            </h3>
            <p className="text-amber-100">
              Réservez maintenant et bénéficiez de nos meilleurs tarifs
            </p>
          </div>

          {/* Avantages */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-amber-200" />
              <span className="font-semibold">Annulation gratuite</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={20} className="text-amber-200" />
              <span className="font-semibold">Meilleur prix garanti</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={20} className="text-amber-200" />
              <span className="font-semibold">Service 5 étoiles</span>
            </div>
          </div>

          {/* Bouton */}
          <Link
            href="/reservations"
            className="btn-secondary bg-white/90 px-8 py-4 font-bold text-gray-900 shadow-2xl hover:bg-white"
          >
            Réserver maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
