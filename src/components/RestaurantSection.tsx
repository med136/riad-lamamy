"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed } from "lucide-react";

const specialties = [
  {
    name: "Petit-déjeuner marocain",
    description: "Une sélection inspirée des saveurs locales, proposée selon l’organisation de votre séjour.",
  },
  {
    name: "Table marocaine",
    description: "Des plats traditionnels peuvent être préparés sur demande, selon disponibilité.",
  },
  {
    name: "Moment gourmand",
    description: "Thé, douceurs et petites attentions pour profiter du riad à votre rythme.",
  },
];

export function RestaurantSection() {
  return (
    <section className="h-full rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] p-6 sm:p-7 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
          <UtensilsCrossed className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B28A47]">La table</p>
          <h3 className="mt-1 font-serif text-[27px] font-medium leading-tight text-[#2B1C17]">Saveurs marocaines</h3>
          <p className="mt-2 text-sm leading-6 text-[#6F625C]">Une cuisine simple, chaleureuse et pensée autour des produits disponibles.</p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
        {specialties.map((dish, index) => (
          <motion.div
            key={dish.name}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="py-4"
          >
            <h4 className="text-[14px] font-semibold text-[#2B1C17]">{dish.name}</h4>
            <p className="mt-1 text-[13px] leading-5 text-[#6F625C]">{dish.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-[16px] border border-[#B28A47]/15 bg-[#F8F5EF]/65 p-4">
        <div className="flex items-center gap-3 text-[13px] text-[#5D514C]">
          <Coffee className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6} />
          Demandes particulières sur réservation
        </div>
        <Link href="/contact" className="shrink-0 text-[12px] font-semibold text-[#0F5A46] hover:text-[#063F33]">Nous contacter →</Link>
      </div>
    </section>
  );
}
