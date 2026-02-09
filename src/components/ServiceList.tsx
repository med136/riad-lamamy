"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Utensils,
  Car,
  Map,
  Umbrella,
  Music,
  Camera,
  Gift,
  Sparkles,
  CheckCircle,
  Clock,
  Users,
  Heart,
} from "lucide-react";

type ServiceItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  duration_minutes: number | null;
};

const fallbackServices = [
  {
    category: "Restauration",
    items: [
      {
        icon: <Utensils size={24} />,
        title: "Petit-dejeuner marocain",
        description:
          "Servi sur la terrasse ou en chambre, avec produits frais locaux.",
        included: true,
      },
      {
        icon: <Utensils size={24} />,
        title: "Diner aux chandelles",
        description:
          "Cuisine traditionnelle preparee par notre chef dans une ambiance romantique.",
        included: false,
        price: "35 EUR / pers",
      },
      {
        icon: <Utensils size={24} />,
        title: "Cours de cuisine",
        description:
          "Apprenez les secrets de la cuisine marocaine avec notre chef.",
        included: false,
        price: "60 EUR / pers",
      },
    ],
  },
  {
    category: "Transport",
    items: [
      {
        icon: <Car size={24} />,
        title: "Transfert aeroport",
        description: "Service prive avec chauffeur francophone.",
        included: false,
        price: "25 EUR / trajet",
      },
      {
        icon: <Car size={24} />,
        title: "Location de vehicule",
        description: "Voiture avec chauffeur pour vos deplacements dans Marrakech.",
        included: false,
        price: "Sur demande",
      },
    ],
  },
  {
    category: "Activites",
    items: [
      {
        icon: <Map size={24} />,
        title: "Visites guidees",
        description:
          "Decouverte de la medina et des sites historiques avec guide certifie.",
        included: false,
        price: "45 EUR / pers",
      },
      {
        icon: <Umbrella size={24} />,
        title: "Excursion Atlas",
        description:
          "Journee complete dans les montagnes de l'Atlas avec dejeuner berbere.",
        included: false,
        price: "85 EUR / pers",
      },
      {
        icon: <Music size={24} />,
        title: "Soiree Gnawa",
        description: "Musique traditionnelle marocaine dans le patio.",
        included: true,
      },
    ],
  },
  {
    category: "Sur mesure",
    items: [
      {
        icon: <Camera size={24} />,
        title: "Seance photo",
        description: "Photographe professionnel pour immortaliser votre sejour.",
        included: false,
        price: "150 EUR",
      },
      {
        icon: <Gift size={24} />,
        title: "Organisation evenements",
        description:
          "Mariages, anniversaires, seminaires dans un cadre exceptionnel.",
        included: false,
        price: "Sur devis",
      },
      {
        icon: <Sparkles size={24} />,
        title: "Surprise romantique",
        description: "Chambre decoree, petals, champagne...",
        included: false,
        price: "A partir de 75 EUR",
      },
    ],
  },
];

export function ServiceList() {
  const [remoteServices, setRemoteServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/services");
        const json = await res.json();
        if (res.ok && Array.isArray(json.services)) {
          setRemoteServices(json.services);
        }
      } catch (e) {
        // silent fallback to static content
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const iconForCategory = (cat: string) => {
    const key = cat.toLowerCase();
    if (key.includes("resta")) return <Utensils size={24} />;
    if (key.includes("trans") || key.includes("aeroport")) return <Car size={24} />;
    if (key.includes("activ") || key.includes("excurs") || key.includes("visite")) return <Map size={24} />;
    if (key.includes("photo")) return <Camera size={24} />;
    if (key.includes("sur mesure") || key.includes("evenement")) return <Sparkles size={24} />;
    return <Sparkles size={24} />;
  };

  const dynamicCategories = useMemo(() => {
    if (!remoteServices.length) return [] as Array<{ category: string; items: any[] }>;
    const groups: Record<string, any[]> = {};
    for (const s of remoteServices) {
      const cat = s.category || "Autres";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({
        icon: iconForCategory(cat),
        title: s.name,
        description: s.description || "",
        included: (s.price || 0) === 0,
        price: (s.price || 0) > 0 ? `${s.price} EUR` : undefined,
        duration: s.duration_minutes || undefined,
      });
    }
    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }, [remoteServices]);

  const categories = dynamicCategories.length ? dynamicCategories : fallbackServices;

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="lux-kicker text-amber-700/80 mb-3">SERVICES</div>
          <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Nos services detailles
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une palette complete pour personnaliser votre experience marocaine
          </p>
        </motion.div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-10">
        <div className="flex items-center space-x-2">
          <CheckCircle size={20} className="text-emerald-600" />
          <span className="text-gray-700">Inclus dans votre sejour</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
            <span className="text-amber-600 text-[10px] font-bold">EUR</span>
          </div>
          <span className="text-gray-700">Service supplementaire</span>
        </div>
      </div>

      <div className="space-y-12">
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.2 }}
          >
            <h4 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-amber-200/60">
              {category.category}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((service, serviceIndex) => (
                <motion.div
                  key={serviceIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.2 + serviceIndex * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`lux-panel rounded-2xl p-6 border ${
                    service.included
                      ? "border-emerald-200/60"
                      : "border-amber-200/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        service.included
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {service.icon}
                    </div>

                    {service.included ? (
                      <div className="flex items-center space-x-1 text-emerald-600">
                        <CheckCircle size={18} />
                        <span className="text-sm font-semibold">INCLUS</span>
                      </div>
                    ) : (
                      <div className="text-amber-700 font-bold">
                        {service.price}
                      </div>
                    )}
                  </div>

                  <h5 className="text-lg font-bold text-gray-900 mb-2">
                    {service.title}
                  </h5>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                  {service.duration && (
                    <p className="text-gray-500 text-xs mt-2">
                      Duree: {service.duration} min
                    </p>
                  )}

                  {!service.included && (
                    <button className="mt-4 w-full bg-amber-700 text-white py-2 rounded-xl hover:bg-amber-800 transition-colors text-sm font-semibold">
                      Reserver ce service
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 bg-gradient-to-r from-slate-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4">
                <Clock size={24} />
              </div>
              <h5 className="font-bold mb-2">Disponibilite</h5>
              <p className="text-slate-200 text-sm">
                Tous nos services sont disponibles 24/7 sur reservation
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4">
                <Users size={24} />
              </div>
              <h5 className="font-bold mb-2">Personnalisation</h5>
              <p className="text-slate-200 text-sm">
                Chaque service est adapte a vos besoins
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4">
                <Heart size={24} />
              </div>
              <h5 className="font-bold mb-2">Qualite</h5>
              <p className="text-slate-200 text-sm">
                Partenaires selectionnes pour une experience premium
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-amber-200">
              Pour toute demande speciale, contactez notre conciergerie.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
