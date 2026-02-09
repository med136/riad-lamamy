"use client";

import { motion } from "framer-motion";
import { Compass, Moon, Sunrise, Coffee } from "lucide-react";

const experiences = [
  {
    time: "MATIN",
    icon: <Sunrise size={28} />,
    title: "Réveil Marrakchi",
    description: "Petit-déjeuner sur la terrasse avec vue sur les toits de la médina.",
    color: "from-amber-400 to-orange-400",
  },
  {
    time: "APRÈS-MIDI",
    icon: <Compass size={28} />,
    title: "Exploration",
    description: "Visite guidée des souks et monuments historiques avec notre guide.",
    color: "from-blue-400 to-cyan-400",
  },
  {
    time: "SOIRÉE",
    icon: <Coffee size={28} />,
    title: "Détente",
    description: "Thé à la menthe au bord de la piscine avant le dîner aux chandelles.",
    color: "from-purple-400 to-pink-400",
  },
  {
    time: "NUIT",
    icon: <Moon size={28} />,
    title: "Magie Nocturne",
    description: "Nuit paisible dans le silence de la médina endormie.",
    color: "from-indigo-400 to-purple-400",
  },
];

export function Experience() {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="lux-kicker mb-3">EXPERIENCE</div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Une Journée Typique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez le rythme enchanteur d&apos;une journée dans notre riad
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Ligne de temps */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-amber-300 via-amber-500 to-stone-400 hidden md:block"></div>

          {/* Expériences */}
          <div className="space-y-12 md:space-y-0">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.time}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Cercle sur la timeline */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 rounded-full bg-white border-4 border-amber-500"></div>
                </div>

                {/* Contenu */}
                <div className={`md:w-5/12 ${
                  index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                }`}>
                  <div className="lux-panel rounded-2xl p-8 border border-amber-200/40 hover:shadow-2xl transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${exp.color} text-white shadow-lg`}>
                        {exp.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-amber-700 tracking-widest">{exp.time}</div>
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600">{exp.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
