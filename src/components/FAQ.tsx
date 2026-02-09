"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Quels sont les horaires de check-in et check-out ?",
    answer:
      "Le check-in est possible a partir de 14h et le check-out jusqu'a 12h. Nous pouvons adapter ces horaires sur demande en fonction des disponibilites.",
  },
  {
    question: "Le petit-dejeuner est-il inclus ?",
    answer:
      "Oui, un petit-dejeuner marocain traditionnel est inclus pour tous nos clients. Il est servi sur la terrasse ou en chambre selon votre preference.",
  },
  {
    question: "Proposez-vous le service de navette aeroport ?",
    answer:
      "Oui, nous proposons un service de transfert prive depuis et vers l'aeroport de Marrakech. Le tarif est de 25 EUR par trajet. Reservez-le a l'avance pour garantir sa disponibilite.",
  },
  {
    question: "Le riad est-il adapte aux enfants ?",
    answer:
      "Absolument ! Nous sommes family-friendly et pouvons fournir des lits bebes, chaises hautes, et organiser des activites adaptees aux enfants. La piscine est surveillee.",
  },
  {
    question: "Acceptez-vous les animaux de compagnie ?",
    answer:
      "Nous acceptons les petits animaux (moins de 10 kg) sur demande prealable. Des frais supplementaires de 15 EUR par nuit s'appliquent.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="lux-panel rounded-3xl border border-amber-200/40 p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-8">
        <HelpCircle size={28} className="text-amber-700" />
        <div>
          <div className="lux-kicker text-amber-700/80 mb-1">FAQ</div>
          <h3 className="text-2xl font-serif font-bold">Questions frequentes</h3>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-amber-200/60 rounded-2xl overflow-hidden bg-white/80"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-6 flex justify-between items-center hover:bg-amber-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">{faq.question}</span>
              <ChevronDown
                size={20}
                className={`text-gray-500 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="p-6 pt-0">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Vous n'avez pas trouve la reponse a votre question ?
          <a
            href="/contact"
            className="text-amber-700 hover:underline font-semibold ml-1"
          >
            Contactez-nous directement
          </a>
        </p>
      </div>
    </div>
  );
}
