"use client";

import { motion } from "framer-motion";
import { Calendar, Home, Star, Award } from "lucide-react";

const milestones = [
  {
    year: "1908",
    title: "Construction du Riad",
    description: "Édification de la demeure par un riche marchand marocain.",
    icon: <Home size={24} />,
  },
  {
    year: "1980",
    title: "Transmission Familiale",
    description: "Reprise par la famille Benjelloun, 2ème génération.",
    icon: <Calendar size={24} />,
  },
  {
    year: "2005",
    title: "Rénovation Complète",
    description: "Restauration dans le respect de l'architecture traditionnelle.",
    icon: <Star size={24} />,
  },
  {
    year: "2020",
    title: "Certification Excellence",
    description: "Reconnaissance internationale pour notre service.",
    icon: <Award size={24} />,
  },
];

export default function History() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600 hidden md:block"></div>

          {/* Milestones */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-start ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Circle */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 rounded-full bg-white border-4 border-amber-500"></div>
                </div>

                {/* Content */}
                <div className={`md:w-5/12 ${
                  index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                }`}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                        {milestone.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-600">
                          {milestone.year}
                        </div>
                        <h4 className="text-xl font-bold">{milestone.title}</h4>
                      </div>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
