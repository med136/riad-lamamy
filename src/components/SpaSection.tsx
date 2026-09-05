"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, Heart } from "lucide-react";

const treatments = [
  {
    name: "Hammam traditionnel",
    description: "Un rituel de détente inspiré des traditions marocaines, organisé sur demande.",
  },
  {
    name: "Massage",
    description: "Un moment de relaxation qui peut être organisé selon les disponibilités de nos partenaires.",
  },
  {
    name: "Soin bien-être",
    description: "Des soins peuvent être proposés selon vos envies et les prestations disponibles lors de votre séjour.",
  },
];

export function SpaSection() {
  return (
    <section className="h-full rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] p-6 sm:p-7 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
          <Droplets className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B28A47]">Bien-être</p>
          <h3 className="mt-1 font-serif text-[27px] font-medium leading-tight text-[#2B1C17]">Prendre le temps</h3>
          <p className="mt-2 text-sm leading-6 text-[#6F625C]">Des moments de détente que notre équipe peut vous aider à organiser pendant votre séjour.</p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
        {treatments.map((treatment, index) => (
          <motion.div
            key={treatment.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="py-4"
          >
            <h4 className="text-[14px] font-semibold text-[#2B1C17]">{treatment.name}</h4>
            <p className="mt-1 text-[13px] leading-5 text-[#6F625C]">{treatment.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-[#B28A47]/15 bg-[#F8F5EF]/65 p-4">
        <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5A46]" strokeWidth={1.6} />
        <div>
          <p className="text-[13px] leading-5 text-[#5D514C]">Les prestations de bien-être sont à organiser à l’avance selon disponibilité.</p>
          <Link href="/contact" className="mt-2 inline-flex text-[12px] font-semibold text-[#0F5A46] hover:text-[#063F33]">Faire une demande →</Link>
        </div>
      </div>
    </section>
  );
}
