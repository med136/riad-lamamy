"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Clock3, Compass, ShoppingBag, Sparkles } from "lucide-react";

const activities = [
  {
    icon: Compass,
    title: "Découverte de la médina",
    description: "Partez à la rencontre des ruelles, monuments et savoir-faire de Fès avec un accompagnement adapté.",
    duration: "Selon programme",
  },
  {
    icon: Camera,
    title: "Balade photographique",
    description: "Une façon différente d’explorer la médina et d’en garder des souvenirs personnels.",
    duration: "Sur demande",
  },
  {
    icon: ShoppingBag,
    title: "Artisanat & bonnes adresses",
    description: "Nous pouvons vous orienter vers les ateliers, souks et adresses qui correspondent à vos envies.",
    duration: "À votre rythme",
  },
  {
    icon: Sparkles,
    title: "Expérience sur mesure",
    description: "Un moment particulier à organiser pendant votre séjour ? Notre équipe peut vous conseiller.",
    duration: "Personnalisable",
  },
];

export function Activities() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto mb-9 max-w-2xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Expériences</p>
        <h3 className="mt-3 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
          Fès, à découvrir à votre rythme
        </h3>
        <p className="mt-3 text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
          Des idées simples et personnalisables pour enrichir votre séjour sans le surcharger.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.article
              key={activity.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="group border-t border-[#B28A47]/20 bg-[#FFFDF8] px-1 py-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
                <Icon className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6} />
              </div>
              <h4 className="mt-4 font-serif text-[22px] font-medium text-[#2B1C17]">{activity.title}</h4>
              <p className="mt-2 text-[13px] leading-6 text-[#6F625C]">{activity.description}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-[#B28A47]/10 pt-3 text-[11px] text-[#6F625C]/80">
                <Clock3 className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6} />
                {activity.duration}
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-9 text-center">
        <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-full border border-[#B28A47]/35 px-5 text-[13px] font-semibold text-[#0F5A46] transition hover:bg-[#F8F5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/60">
          Parler à notre équipe
        </Link>
      </div>
    </section>
  );
}
