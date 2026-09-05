"use client";

import { motion } from "framer-motion";
import { Heart, Home, Sparkles, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Value = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const values: Value[] = [
  {
    icon: Home,
    title: "Authenticité",
    description:
      "Une maison qui met en valeur les matières, les détails et l’atmosphère propres à l’art de vivre de Fès.",
  },
  {
    icon: Heart,
    title: "Accueil",
    description:
      "Une hospitalité simple et attentive, avec le souci de rendre chaque séjour naturel et agréable.",
  },
  {
    icon: Sparkles,
    title: "Soin du détail",
    description:
      "Des espaces, des attentions et des services pensés avec discrétion, sans surcharger l’expérience.",
  },
  {
    icon: UsersRound,
    title: "Proximité",
    description:
      "Une maison à taille humaine, où l’échange et la disponibilité font partie de l’expérience Dar LaMamy.",
  },
];

export default function Values() {
  return (
    <section className="bg-[#FFFDF8] py-14 sm:py-16">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-9 max-w-2xl text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">
            Notre manière de recevoir
          </p>
          <h2 className="mt-3 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
            Ce qui guide Dar LaMamy
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
            Quelques principes simples qui donnent le ton de la maison et de votre séjour.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group rounded-[20px] border border-[#B28A47]/15 bg-[#FFFDF8] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B28A47]/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
                  <Icon className="h-4.5 w-4.5 text-[#0F5A46]" strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 font-serif text-[22px] font-medium text-[#2B1C17]">
                  {value.title}
                </h3>
                <div className="mt-3 h-px w-8 bg-[#B28A47]/35 transition-all duration-300 group-hover:w-12" />
                <p className="mt-3 text-[13px] leading-5 text-[#6F625C]">
                  {value.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
