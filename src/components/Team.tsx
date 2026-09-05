"use client";

import { motion } from "framer-motion";
import { HeartHandshake, MessageCircleMore, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: HeartHandshake,
    kicker: "Accueil",
    title: "Une présence attentive",
    description:
      "De votre arrivée à votre départ, l’équipe reste disponible pour vous orienter et faciliter votre séjour.",
  },
  {
    icon: MessageCircleMore,
    kicker: "Conseils",
    title: "Fès à votre rythme",
    description:
      "Adresses, visites, déplacements ou demandes particulières : nous vous aidons à organiser ce qui compte pour vous.",
  },
  {
    icon: Sparkles,
    kicker: "Sur mesure",
    title: "Des attentions discrètes",
    description:
      "Une expérience personnalisée ne signifie pas en faire trop : juste trouver le bon détail au bon moment.",
  },
];

export default function Team() {
  return (
    <section className="border-y border-[#B28A47]/10 bg-[#F8F5EF] py-14 sm:py-16">
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">
              L’esprit de la maison
            </p>
            <h2 className="mt-3 max-w-md font-serif text-[32px] font-medium leading-[1.08] text-[#2B1C17] sm:text-[38px]">
              Recevoir avec simplicité et attention
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
              Dar LaMamy privilégie une relation humaine et directe. L’idée n’est pas d’imposer un programme, mais de vous aider à profiter de Fès à votre manière.
            </p>

            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <span className="h-px w-10 bg-[#B28A47]/45" />
              <span className="h-[6px] w-[6px] rotate-45 border border-[#B28A47]/65" />
              <span className="h-px w-5 bg-[#B28A47]/25" />
            </div>
          </motion.div>

          <div className="space-y-3">
            {pillars.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="grid gap-4 rounded-[18px] border border-[#B28A47]/14 bg-[#FFFDF8] p-5 sm:grid-cols-[44px_1fr] sm:items-start"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
                    <Icon className="h-4.5 w-4.5 text-[#0F5A46]" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B28A47]">
                      {item.kicker}
                    </p>
                    <h3 className="mt-1 font-serif text-[21px] font-medium text-[#2B1C17]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-5 text-[#6F625C]">
                      {item.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
