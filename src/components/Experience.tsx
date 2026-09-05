"use client";

import { motion } from "framer-motion";
import {
  Coffee,
  Compass,
  Moon,
  Sunrise,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const experiences = [
  {
    time: "MATIN",
    icon: Sunrise,
    title: "Réveil fassi",
    description:
      "Commencez la journée autour d’un petit-déjeuner marocain, dans le calme de la maison et l’atmosphère unique de la médina.",
  },
  {
    time: "APRÈS-MIDI",
    icon: Compass,
    title: "Au cœur de la médina",
    description:
      "Partez à la découverte des ruelles de Fès, de ses artisans, de son patrimoine et de ses adresses emblématiques.",
  },
  {
    time: "SOIRÉE",
    icon: Coffee,
    title: "Un moment de détente",
    description:
      "Retrouvez la sérénité de Dar LaMamy autour d’un thé à la menthe après une journée de découverte.",
  },
  {
    time: "NUIT",
    icon: Moon,
    title: "Le calme retrouvé",
    description:
      "Profitez d’une nuit paisible dans l’atmosphère intime de la médina, loin de l’agitation de la journée.",
  },
];

export function Experience() {
  const { t } = useLanguage();
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]
        py-14
        sm:py-16
        lg:py-18
      "
    >
      {/* Background decoration */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_12%_20%,rgba(178,138,71,0.055),transparent_34%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_88%_75%,rgba(15,90,70,0.045),transparent_34%)]
        "
        aria-hidden="true"
      />

      <div className="site-container relative">
        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            mx-auto
            mb-10
            max-w-3xl
            text-center
            lg:mb-12
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <span
              className="
                h-px
                w-9
                bg-[#B28A47]/50
              "
            />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B28A47]
              "
            >
              {t("home.experience.kicker")}
            </span>

            <span
              className="
                h-px
                w-9
                bg-[#B28A47]/50
              "
            />
          </div>

          <h2
            className="
              font-serif
              text-[2.45rem]
              font-medium
              leading-[1.05]
              tracking-[-0.025em]
              text-[#201A17]
              sm:text-[2.9rem]
              lg:text-[3.2rem]
            "
          >
            {t("home.experience.title_before")}
            <span className="text-[#0F5A46]">
              {" "}
              {t("home.experience.title_accent")}
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-[15px]
              font-light
              leading-[1.7]
              text-gray-600
              sm:text-[16px]
            "
          >
            {t("home.experience.description")}
          </p>

          <div
            className="
              mx-auto
              mt-5
              flex
              w-[150px]
              items-center
            "
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-[#B28A47]/35" />

            <span
              className="
                mx-3
                h-[6px]
                w-[6px]
                rotate-45
                border
                border-[#B28A47]/60
              "
            />

            <span className="h-px flex-1 bg-[#B28A47]/35" />
          </div>
        </motion.div>

        {/* TIMELINE */}

        <div
          className="
            relative
            mx-auto
            max-w-5xl
          "
        >
          {/* Central line */}

          <div
            className="
              absolute
              bottom-4
              left-1/2
              top-4
              hidden
              w-px
              -translate-x-1/2
              bg-gradient-to-b
              from-transparent
              via-[#B28A47]/45
              to-transparent
              md:block
            "
            aria-hidden="true"
          />

          <div className="space-y-5 md:space-y-4">
            {experiences.map(
              (experience, index) => {
                const Icon =
                  experience.icon;

                const reverse =
                  index % 2 === 0;

                return (
                  <motion.article
                    key={experience.time}
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.25,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index * 0.07,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className={`
                      relative
                      flex
                      flex-col
                      md:flex-row
                      md:items-center
                      ${
                        reverse
                          ? "md:flex-row-reverse"
                          : ""
                      }
                    `}
                  >
                    {/* Center point */}

                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        z-20
                        hidden
                        h-3.5
                        w-3.5
                        -translate-x-1/2
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#B28A47]
                        bg-[#FFFDF8]
                        shadow-[0_0_0_5px_rgba(255,253,248,0.95)]
                        md:flex
                      "
                      aria-hidden="true"
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#0F5A46]
                        "
                      />
                    </div>

                    {/* Empty half */}

                    <div className="hidden md:block md:w-1/2" />

                    {/* Card */}

                    <div
                      className={`
                        w-full
                        md:w-1/2
                        ${
                          reverse
                            ? "md:pr-10 lg:pr-14"
                            : "md:pl-10 lg:pl-14"
                        }
                      `}
                    >
                      <div
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-[22px]

                          border
                          border-[#B28A47]/18

                          bg-white/80

                          p-5

                          shadow-[0_16px_45px_-38px_rgba(35,20,12,0.32)]

                          backdrop-blur-sm

                          transition-all
                          duration-300

                          hover:-translate-y-0.5
                          hover:border-[#B28A47]/30
                          hover:shadow-[0_20px_55px_-36px_rgba(35,20,12,0.38)]

                          sm:p-6
                        "
                      >
                        <div
                          className="
                            relative
                            z-10
                            flex
                            items-start
                            gap-4
                          "
                        >
                          {/* Icon */}

                          <div
                            className="
                              inline-flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl

                              border
                              border-[#B28A47]/25

                              bg-[#0F5A46]/5

                              text-[#0F5A46]
                            "
                          >
                            <Icon
                              size={20}
                              strokeWidth={1.6}
                            />
                          </div>

                          <div className="min-w-0">
                            <p
                              className="
                                mb-1
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.25em]
                                text-[#B28A47]
                              "
                            >
                              {
                                experience.time
                              }
                            </p>

                            <h3
                              className="
                                font-serif
                                text-[21px]
                                font-medium
                                leading-tight
                                tracking-[-0.015em]
                                text-[#201A17]
                              "
                            >
                              {
                                experience.title
                              }
                            </h3>

                            <p
                              className="
                                mt-2
                                text-[14px]
                                font-light
                                leading-[1.65]
                                text-gray-600
                              "
                            >
                              {
                                experience.description
                              }
                            </p>
                          </div>
                        </div>

                        {/* subtle accent */}

                        <div
                          className="
                            absolute
                            bottom-0
                            left-8
                            right-8
                            h-px
                            scale-x-0
                            bg-gradient-to-r
                            from-transparent
                            via-[#B28A47]/45
                            to-transparent
                            transition-transform
                            duration-300
                            group-hover:scale-x-100
                          "
                        />
                      </div>
                    </div>
                  </motion.article>
                );
              },
            )}
          </div>
        </div>

        {/* CLOSING */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            mx-auto
            mt-9
            max-w-xl
            text-center
          "
        >
          <p
            className="
              font-serif
              text-[18px]
              font-normal
              leading-relaxed
              text-[#0F5A46]/85
              sm:text-[19px]
            "
          >
            {t("home.experience.closing")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}