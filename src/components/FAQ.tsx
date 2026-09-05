"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Comment effectuer une demande de réservation ?",
    answer:
      "Vous pouvez utiliser notre page Réservations ou nous contacter directement. Toute demande reste soumise à disponibilité et confirmation.",
  },
  {
    question: "Puis-je vous contacter pour organiser un transfert ?",
    answer:
      "Oui. Indiquez votre besoin dans le formulaire de contact et notre équipe vous confirmera les possibilités disponibles pour vos dates.",
  },
  {
    question: "Pouvez-vous nous conseiller pour découvrir Fès ?",
    answer:
      "Oui. Nous pouvons vous orienter vers des visites, adresses et expériences adaptées à vos envies pendant votre séjour.",
  },
  {
    question: "Puis-je faire une demande particulière avant mon arrivée ?",
    answer:
      "Bien sûr. Précisez votre demande dans votre message afin que nous puissions vous répondre selon les possibilités et disponibilités du moment.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] px-6 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#B28A47]">
          Avant de nous écrire
        </p>
        <h2 className="mt-2 font-serif text-[28px] font-medium text-[#2B1C17] sm:text-[32px]">
          Questions fréquentes
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-[#6F625C]">
          Quelques réponses utiles pour préparer votre séjour à Dar LaMamy.
        </p>
      </div>

      <div className="mx-auto mt-7 max-w-3xl divide-y divide-[#B28A47]/12 border-y border-[#B28A47]/12">
        {faqs.map((faq, index) => {
          const open = openIndex === index;

          return (
            <div key={faq.question}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-serif text-[18px] font-medium text-[#2B1C17] sm:text-[19px]">
                  {faq.question}
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 text-[#0F5A46]">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.6}
                  />
                </span>
              </button>

              {open && (
                <div className="pb-5 pr-12">
                  <p className="text-[13px] leading-6 text-[#6F625C]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px] text-[#6F625C]">
        Vous n’avez pas trouvé votre réponse ?{" "}
        <Link
          href="/contact"
          className="font-semibold text-[#0F5A46] underline decoration-[#B28A47]/40 underline-offset-4"
        >
          Écrivez-nous directement
        </Link>
        .
      </p>
    </section>
  );
}
