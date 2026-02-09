"use client";

import { useState } from "react";
import { MapPin, Navigation, Car, Footprints } from "lucide-react";

export default function Map() {
  const [activeTransport, setActiveTransport] = useState("walk");

  const transportOptions = [
    { id: "walk", icon: <Footprints size={20} />, label: "A pied", time: "15 min" },
    { id: "car", icon: <Car size={20} />, label: "Voiture", time: "5 min" },
    { id: "taxi", icon: <Navigation size={20} />, label: "Taxi", time: "8 min" },
  ];

  const landmarks = [
    { name: "Place Jemaa el-Fna", distance: "800 m" },
    { name: "Palais Bahia", distance: "1.2 km" },
    { name: "Jardin Majorelle", distance: "2.5 km" },
    { name: "Aeroport", distance: "6 km" },
  ];

  return (
    <div className="lux-panel rounded-3xl border border-amber-200/40 overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
        <div className="lux-kicker text-amber-200/80 mb-2">LOCALISATION</div>
        <div className="flex items-center space-x-3">
          <MapPin size={26} />
          <div>
            <h3 className="text-xl font-serif font-bold">Localisation</h3>
            <p className="text-slate-300">Au coeur de la medina de Marrakech</p>
          </div>
        </div>
      </div>

      <div className="relative h-64 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.25),transparent_55%)] bg-amber-50">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-amber-600/20 flex items-center justify-center mb-4">
            <MapPin size={28} className="text-amber-700" />
          </div>
          <h4 className="text-xl font-bold text-amber-900 mb-1">
            Carte interactive
          </h4>
          <p className="text-amber-800">
            Integrez Google Maps ou Mapbox avec votre cle API
          </p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
              <MapPin size={22} className="text-white" />
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
              <div className="font-bold text-gray-900">Nous sommes ici</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-4">Comment nous rejoindre</h4>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {transportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveTransport(option.id)}
              className={`p-3 rounded-2xl text-center transition-all border ${
                activeTransport === option.id
                  ? "bg-amber-700 text-white border-amber-700"
                  : "bg-white/80 text-gray-700 border-amber-200/60 hover:border-amber-400"
              }`}
            >
              <div className="mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-75">{option.time}</div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 mb-2">A proximite</h4>
          {landmarks.map((landmark, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100/60"
            >
              <span className="text-gray-700">{landmark.name}</span>
              <span className="text-amber-700 font-semibold">{landmark.distance}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            <span className="font-bold">Conseil :</span> Depuis la place Jemaa
            el-Fna, suivez la rue Riad Zitoun el-Kedim. Notre riad se trouve dans
            la 3eme ruelle a droite apres la mosquee.
          </p>
        </div>
      </div>
    </div>
  );
}
