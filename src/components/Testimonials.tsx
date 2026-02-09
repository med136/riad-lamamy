"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Quote,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type TestimonialItem = {
  id: number | string;
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  stay: string;
  featured?: boolean;
};

const defaultTestimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Sophie et Thomas",
    location: "Paris, France",
    date: "Janvier 2024",
    rating: 5,
    text: "Un sejour absolument magique. Le riad est encore plus beau qu'en photo. L'accueil est chaleureux, les chambres spacieuses et le petit-dejeuner sur la terrasse etait un reve.",
    avatar: "ST",
    stay: "7 nuits en Suite Royale",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    location: "Madrid, Espagne",
    date: "Decembre 2023",
    rating: 5,
    text: "Le service est exceptionnel. L'equipe a tout fait pour rendre notre voyage de noces inoubliable. Les diners aux chandelles et les recommandations personnalisees... tout etait parfait.",
    avatar: "MR",
    stay: "5 nuits en Chambre Deluxe",
    featured: true,
  },
  {
    id: 3,
    name: "James Wilson",
    location: "Londres, Royaume-Uni",
    date: "Novembre 2023",
    rating: 4,
    text: "Excellent rapport qualite-prix. L'emplacement est ideal pour explorer la medina. Le hammam etait incroyable apres une journee de visite.",
    avatar: "JW",
    stay: "4 nuits en Chambre Standard",
  },
  {
    id: 4,
    name: "Anna Schmidt",
    location: "Berlin, Allemagne",
    date: "Octobre 2023",
    rating: 5,
    text: "Une oasis de paix au coeur de Marrakech. Le jardin et la piscine sont magnifiques. Le personnel est aux petits soins. Une experience authentique.",
    avatar: "AS",
    stay: "6 nuits en Suite Royale",
  },
];

export function Testimonials({ items: initialItems }: { items?: TestimonialItem[] }) {
  const [items, setItems] = useState<TestimonialItem[]>(
    initialItems && initialItems.length ? initialItems : defaultTestimonials
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (initialItems && initialItems.length) return;
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load testimonials");
        const { data } = await res.json();
        if (Array.isArray(data)) {
          const transformed = data.map((t: any, idx: number) => {
            const name: string = t.guest_name || t.name || "Client";
            const country: string = t.guest_country || t.location || "";
            const created: string = t.created_at || new Date().toISOString();
            const date = new Intl.DateTimeFormat("fr-FR", {
              month: "long",
              year: "numeric",
            }).format(new Date(created));
            const initials = name
              .split(" " )
              .filter(Boolean)
              .map((part: string) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return {
              id: t.id ?? idx,
              name,
              location: country,
              date,
              rating: t.rating ?? 5,
              text: t.content ?? t.text ?? "",
              avatar: initials,
              stay: "",
              featured: !!t.featured,
            } as TestimonialItem;
          });
          if (transformed.length) setItems(transformed);
        }
      } catch (e) {
        // fallback to defaultTestimonials
      }
    };
    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 text-amber-700 mb-4">
              <Quote size={22} />
              <span className="lux-kicker">TEMOIGNAGES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Ce que disent nos voyageurs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des experiences authentiques, partagees par nos clients.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { value: "4.9/5", label: "Note moyenne" },
            { value: "98%", label: "Taux de retour" },
            { value: "500+", label: "Clients satisfaits" },
            { value: "100%", label: "Recommandation" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="lux-panel rounded-2xl p-6 text-center border border-amber-200/50"
            >
              <div className="text-3xl font-bold text-amber-700 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative">
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white/90 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white/90 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ChevronRight size={24} />
          </button>

          <motion.div
            key={items[currentIndex].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-3xl p-8 md:p-12 shadow-2xl border ${
              items[currentIndex].featured
                ? "bg-gradient-to-br from-amber-700 to-amber-800 border-amber-600"
                : "lux-panel border-amber-200/60"
            }`}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                  items[currentIndex].featured
                    ? "bg-white text-amber-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {items[currentIndex].avatar}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h3
                    className={`text-xl font-bold ${
                      items[currentIndex].featured
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {items[currentIndex].name}
                  </h3>

                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < items[currentIndex].rating
                            ? items[currentIndex].featured
                              ? "text-white fill-white"
                              : "text-amber-500 fill-amber-500"
                            : items[currentIndex].featured
                            ? "text-white/40"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className={`flex flex-wrap gap-4 text-sm ${
                    items[currentIndex].featured
                      ? "text-amber-100"
                      : "text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {items[currentIndex].location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {items[currentIndex].date}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <Quote
                className={`w-8 h-8 mb-4 ${
                  items[currentIndex].featured
                    ? "text-amber-200"
                    : "text-amber-300"
                }`}
              />
              <p
                className={`text-lg leading-relaxed ${
                  items[currentIndex].featured
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {items[currentIndex].text}
              </p>
            </div>

            <div
              className={`text-sm font-medium px-4 py-2 rounded-full inline-block ${
                items[currentIndex].featured
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {items[currentIndex].stay}
            </div>
          </motion.div>

          <div className="flex justify-center space-x-2 mt-8">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-amber-700 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Consultez aussi nos avis sur :</p>
          <div className="flex flex-wrap justify-center gap-6">
            {["TripAdvisor", "Booking.com", "Google", "Airbnb"].map(
              (platform) => (
                <div
                  key={platform}
                  className="lux-panel px-6 py-3 rounded-2xl border border-amber-200/60"
                >
                  <div className="text-2xl font-bold text-amber-700">4.8</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="text-amber-500 fill-amber-500"
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{platform}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className="text-center mt-6">
        <a
          href="/temoignage"
          className="btn-secondary px-6 py-3 text-sm shadow-sm hover:bg-white"
        >
          Laisser un avis
        </a>
      </div>
    </section>
  );
}
