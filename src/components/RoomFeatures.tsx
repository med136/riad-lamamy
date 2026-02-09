"use client";

import { motion } from "framer-motion";
import { 
  Lock, Wind, Thermometer, Tv, Wifi, Coffee, 
  Droplets, Shield, Bell, Clock, Heart, Sparkles
} from "lucide-react";

const features = [
  {
    icon: <Wind size={24} />,
    title: "Climatisation Réversible",
    description: "Contrôle individuel de la température dans chaque chambre pour votre confort optimal.",
  },
  {
    icon: <Wifi size={24} />,
    title: "Fibre Optique",
    description: "Connexion internet ultra-rapide dans tout le riad, idéale pour le télétravail.",
  },
  {
    icon: <Lock size={24} />,
    title: "Sécurité Totale",
    description: "Système d'alarme, coffre-fort et surveillance 24h/24 pour votre tranquillité d'esprit.",
  },
  {
    icon: <Droplets size={24} />,
    title: "Salle de Bain Premium",
    description: "Produits d'accueil bio, serviettes épaisses et sèche-cheveux professionnel.",
  },
  {
    icon: <Coffee size={24} />,
    title: "Service en Chambre",
    description: "Petit-déjeuner, déjeuner et dîner servis dans le confort de votre chambre.",
  },
  {
    icon: <Tv size={24} />,
    title: "Divertissement",
    description: "TV écran plat avec chaînes internationales et Netflix inclus.",
  },
];

const services = [
  {
    icon: <Bell size={20} />,
    text: "Réveil personnalisé avec thé à la menthe",
  },
  {
    icon: <Clock size={20} />,
    text: "Check-in/out flexible selon vos besoins",
  },
  {
    icon: <Sparkles size={20} />,
    text: "Service de repassage express",
  },
  {
    icon: <Heart size={20} />,
    text: "Attention particulière pour occasions spéciales",
  },
];

export function RoomFeatures() {
  return (
    <div className="py-16">
      {/* Titre */}
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
          Confort & Équipements
        </h3>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tout le confort moderne dans le respect des traditions marocaines
        </p>
      </div>

      {/* Grille des features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="lux-panel p-8 rounded-2xl border border-amber-200/40 shadow-2xl hover:shadow-[0_25px_70px_-40px_rgba(120,87,71,0.7)] transition-all"
          >
            <div className="text-amber-600 mb-4">{feature.icon}</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h4>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Services supplémentaires */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Sparkles size={28} />
            </div>
            <h4 className="text-2xl font-serif font-bold mb-2">
              Services Additionnels
            </h4>
            <p className="text-amber-100">
              Des petites attentions qui font la différence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  {service.icon}
                </div>
                <span>{service.text}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="text-center mt-8 text-amber-100 text-sm">
            <p>
              Tous nos services sont inclus dans le prix de la chambre.
              Pas de frais cachés.
            </p>
          </div>
        </div>
      </div>

      {/* Garantie */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center space-x-4 bg-amber-50/70 px-8 py-4 rounded-full">
          <Shield size={24} className="text-amber-600" />
          <div>
            <div className="font-bold text-gray-900">
              Garantie Satisfaction 100%
            </div>
            <div className="text-gray-600 text-sm">
              Si vous n&apos;êtes pas satisfait, nous remboursons votre première nuit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
