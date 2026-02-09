"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { 
  Coffee, Wifi, Car, Umbrella, Wine, Music, 
  Sparkles, Shield, Heart, Clock 
} from "lucide-react";

type ApiService = {
  id: string | number;
  name: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  duration_minutes?: number | null;
  is_active?: boolean;
  display_order?: number | null;
};

type UiService = {
  id: string | number;
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  price?: number | null;
};

const fallbackServices: UiService[] = [
  {
    id: "breakfast",
    icon: <Coffee size={28} />,
    title: "Petit-déjeuner Marocain",
    description: "Délicieux petit-déjeuner traditionnel servi sur la terrasse ou dans votre chambre.",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "wifi",
    icon: <Wifi size={28} />,
    title: "Wi-Fi Haut Débit",
    description: "Connexion internet gratuite dans tout le riad et les chambres.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "transfer",
    icon: <Car size={28} />,
    title: "Transfert Aéroport",
    description: "Service de transfert privé depuis et vers l'aéroport de Marrakech.",
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "excursions",
    icon: <Umbrella size={28} />,
    title: "Excursions Guidées",
    description: "Organisation d'excursions personnalisées dans Marrakech et ses environs.",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "dinner",
    icon: <Wine size={28} />,
    title: "Dîner aux Chandelles",
    description: "Dîners romantiques avec spécialités marocaines préparées par notre chef.",
    color: "from-rose-500 to-red-500",
  },
  {
    id: "music",
    icon: <Music size={28} />,
    title: "Soirées Musicales",
    description: "Soirées avec musique traditionnelle marocaine dans le patio.",
    color: "from-violet-500 to-purple-500",
  },
];

const highlights = [
  {
    icon: <Sparkles size={24} />,
    text: "Service personnalisé 24h/24",
  },
  {
    icon: <Shield size={24} />,
    text: "Sécurité et discrétion garanties",
  },
  {
    icon: <Heart size={24} />,
    text: "Attention particulière aux détails",
  },
  {
    icon: <Clock size={24} />,
    text: "Flexibilité horaire",
  },
];

export function Services() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch("/api/services", { cache: "no-store", signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data?.services) ? (data.services as ApiService[]) : [];
        if (items.length) setServices(items);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const dynamicServices = useMemo<UiService[]>(() => {
    if (!services.length) return [];

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const palette = [
      { key: "restauration", color: "from-amber-500 to-orange-500", icon: <Coffee size={28} /> },
      { key: "transport", color: "from-emerald-500 to-green-500", icon: <Car size={28} /> },
      { key: "spa", color: "from-rose-500 to-red-500", icon: <Sparkles size={28} /> },
      { key: "activite", color: "from-purple-500 to-pink-500", icon: <Umbrella size={28} /> },
      { key: "sur_mesure", color: "from-violet-500 to-purple-500", icon: <Music size={28} /> },
      { key: "default", color: "from-blue-500 to-cyan-500", icon: <Wifi size={28} /> },
    ];

    const pickByCategory = (categoryRaw?: string | null) => {
      const category = categoryRaw ? normalize(categoryRaw) : "";
      if (category.includes("restauration")) return palette.find((p) => p.key === "restauration") || null;
      if (category.includes("transport")) return palette.find((p) => p.key === "transport") || null;
      if (category.includes("spa")) return palette.find((p) => p.key === "spa") || null;
      if (category.includes("activite")) return palette.find((p) => p.key === "activite") || null;
      if (category.includes("sur_mesure")) return palette.find((p) => p.key === "sur_mesure") || null;
      return null;
    };

    return services
      .filter((s) => (typeof s.is_active === "boolean" ? s.is_active : true))
      .slice(0, 6)
      .map((s, idx) => {
        const picked = pickByCategory(s.category) || palette[idx % palette.length];
        return {
          id: s.id ?? idx,
          icon: picked.icon,
          title: s.name || "Service",
          description: (s.description || "Un service pensé pour sublimer votre séjour.").trim(),
          color: picked.color,
          price: typeof s.price === "number" ? s.price : null,
        } satisfies UiService;
      });
  }, [services]);

  const displayServices = dynamicServices.length ? dynamicServices : fallbackServices;
  const gridItems: Array<UiService | null> = loading
    ? Array.from({ length: 6 }, () => null)
    : displayServices;

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="lux-kicker mb-3">SERVICES</div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Nos Services Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tout est pensé pour rendre votre séjour exceptionnel et mémorable.
            </p>
          </motion.div>
        </div>

        {/* Grille des services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {gridItems.map((service, index) => (
            <motion.div
              key={service?.id ?? index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="lux-panel rounded-2xl p-8 border border-amber-200/40 shadow-2xl hover:shadow-[0_25px_70px_-40px_rgba(120,87,71,0.7)] transition-all"
            >
              {!service ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-amber-100" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-4 w-2/5 rounded bg-amber-100" />
                </div>
              ) : (
                <>
                  {/* Icon avec dégradé */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${service.color} mb-6`}>
                    <div className="text-white">
                      {service.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
              
                  <div className="text-amber-600 text-sm font-semibold">
                    {typeof service.price === "number" && service.price > 0 ? `À partir de ${service.price} EUR` : "Inclus dans votre séjour"}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-center mb-8">
              Pourquoi nous choisir ?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-2xl mb-4">
                    {highlight.icon}
                  </div>
                  <span className="font-semibold">{highlight.text}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 text-amber-100">
              <p className="text-lg">
                Notre équipe dévouée est à votre service pour rendre votre séjour inoubliable.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Besoin d&apos;un service particulier ? Notre conciergerie est à votre disposition.
          </p>
          <a
            href="/contact"
            className="btn-primary group space-x-2 px-10 py-4 shadow-xl hover:shadow-[0_28px_80px_-40px_rgba(120,87,71,0.7)]"
          >
            <span>Demander un service personnalisé</span>
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
