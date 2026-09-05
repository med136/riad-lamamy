"use client";

import { motion } from "framer-motion";
import {
  Coffee,
  Droplets,
  Heart,
  Lock,
  Sparkles,
  ThermometerSun,
  Wifi,
} from "lucide-react";

const features = [
  {
    icon: ThermometerSun,
    title: "Confort thermique",
    description: "Une atmosphère agréable pensée pour votre confort tout au long du séjour.",
  },
  {
    icon: Wifi,
    title: "Connexion Wi-Fi",
    description: "Une connexion disponible pour rester connecté simplement pendant votre séjour.",
  },
  {
    icon: Lock,
    title: "Tranquillité",
    description: "Des espaces conçus pour préserver votre intimité et votre sérénité.",
  },
  {
    icon: Droplets,
    title: "Salle de bain",
    description: "Des équipements fonctionnels et soignés dans un esprit sobre et confortable.",
  },
  {
    icon: Coffee,
    title: "Hospitalité",
    description: "Des attentions simples et chaleureuses pour accompagner votre expérience à Fès.",
  },
  {
    icon: Heart,
    title: "Séjour personnalisé",
    description: "Notre équipe reste disponible pour vous conseiller avant et pendant votre séjour.",
  },
];

export function RoomFeatures() {
  return (
    <section className="py-12 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Confort</p>
        <h2 className="mt-2 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
          Le confort, avec simplicité
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
          Des équipements utiles, une atmosphère authentique et l’attention portée aux détails.
        </p>
      </div>

      <div className="mt-9 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="flex gap-4 border-b border-[#B28A47]/15 py-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#FFFDF8]">
                <Icon size={17} className="text-[#0F5A46]" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[#2B1C17]">{feature.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-[#6F625C]">{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-[26px] bg-[#0F5A46] px-6 py-8 sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-9">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-[#D2AA5A]">
            <Sparkles size={16} strokeWidth={1.6} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">L’expérience Dar LaMamy</span>
          </div>
          <h3 className="mt-3 font-serif text-[28px] font-medium leading-tight text-[#FFFDF8] sm:text-[32px]">
            Une maison de Fès, pensée pour vous accueillir
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-[#FFFDF8]/75 sm:text-[14px]">
            Chaque séjour peut être préparé avec notre équipe selon vos besoins et les possibilités disponibles.
          </p>
        </div>
      </div>
    </section>
  );
}
