"use client";

import { motion } from "framer-motion";
import { Users, Heart, Coffee, Sparkles } from "lucide-react";

const teamMembers = [
  {
    name: "Ahmed Benjelloun",
    role: "Fondateur et directeur",
    description: "3eme generation a preserver les traditions du riad.",
    icon: <Users size={24} />,
  },
  {
    name: "Fatima Zahra",
    role: "Chef de cuisine",
    description: "Specialiste de la gastronomie marocaine traditionnelle.",
    icon: <Heart size={24} />,
  },
  {
    name: "Karim Alami",
    role: "Responsable reception",
    description: "Votre contact privilegie pour un sejour sur mesure.",
    icon: <Coffee size={24} />,
  },
  {
    name: "Leila Mourad",
    role: "Concierge et spa",
    description: "Organise vos experiences et soins bien-etre.",
    icon: <Sparkles size={24} />,
  },
];

export default function Team() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <div className="lux-kicker text-amber-700/80 mb-3">EQUIPE</div>
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Notre equipe
        </h3>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Des passionnes devoues a votre bien-etre
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="lux-panel rounded-2xl p-8 border border-amber-200/50 text-center shadow-lg"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <div className="text-amber-700">{member.icon}</div>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {member.name}
            </h4>
            <div className="text-amber-700 font-semibold mb-3">{member.role}</div>
            <p className="text-gray-600">{member.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
