"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const stats = [
  {
    value: "15 ans",
    label: "d’expérience",
  },
  {
    value: "12",
    label: "chambres uniques",
  },
  {
    value: "5 000+",
    label: "voyageurs accueillis",
  },
  {
    value: "98 %",
    label: "de satisfaction",
  },
];

export function AboutPreview() {
  const { t } = useLanguage();

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]
        py-20
        sm:py-24
        lg:py-28
      "
    >
      {/* Fond décoratif très subtil */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_12%_18%,rgba(178,138,71,0.08),transparent_38%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_88%_72%,rgba(15,90,70,0.06),transparent_40%)]
        "
        aria-hidden="true"
      />

      <div className="site-container relative">
        <div
          className="
            grid
            grid-cols-1
            items-center
            gap-14
            lg:grid-cols-2
            lg:gap-20
            xl:gap-24
          "
        >
          {/* =================================================
              TEXTE
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
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
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Kicker */}

            <div
              className="
                mb-5
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-[#B28A47]
                "
              >
                {t("home.about.kicker")}
              </span>

              <span
                className="
                  h-px
                  w-12
                  bg-[#B28A47]/50
                "
                aria-hidden="true"
              />
            </div>

            {/* Titre */}

            <h2
              className="
                max-w-[680px]
                font-serif
                text-[2.55rem]
                font-medium
                leading-[1.05]
                tracking-[-0.025em]
                text-[#201A17]
                sm:text-5xl
                lg:text-[3.4rem]
              "
            >
              {t("home.about.title_before")}
              <span
                className="
                  mt-1
                  block
                  text-[#0F5A46]
                "
              >
                {t("home.about.title_accent")}
              </span>
            </h2>

            {/* Texte */}

            <p
              className="
                mt-7
                max-w-[650px]
                text-[16px]
                font-light
                leading-[1.9]
                text-gray-600
                sm:text-[17px]
              "
            >
              {t("home.about.description")}
            </p>

            {/* Ligne décorative */}

            <div
              className="
                mt-8
                flex
                w-[220px]
                items-center
              "
              aria-hidden="true"
            >
              <span
                className="
                  h-px
                  flex-1
                  bg-[#B28A47]/45
                "
              />

              <span
                className="
                  mx-3
                  h-[6px]
                  w-[6px]
                  rotate-45
                  border
                  border-[#B28A47]/65
                "
              />

              <span
                className="
                  h-px
                  flex-1
                  bg-[#B28A47]/45
                "
              />
            </div>

            {/* =================================================
                STATS
                ================================================= */}

            <div
              className="
                mt-8
                grid
                grid-cols-2
                gap-x-8
                gap-y-7
                sm:grid-cols-4
                sm:gap-x-5
              "
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    y: 14,
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
                    delay: 0.08 * index,
                  }}
                  className="
                    relative
                    min-w-0
                  "
                >
                  <p
                    className="
                      font-serif
                      text-[24px]
                      font-medium
                      leading-none
                      text-[#0F5A46]
                      sm:text-[26px]
                    "
                  >
                    {stat.value}
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-relaxed
                      text-gray-500
                      sm:text-[13px]
                    "
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* =================================================
                CTA
                ================================================= */}

            <div className="mt-9">
              <Link
                href="/a-propos"
                className="
                  group
                  inline-flex
                  items-center
                  gap-3

                  text-[15px]
                  font-semibold
                  text-[#0F5A46]

                  transition-colors
                  duration-200

                  hover:text-[#12604B]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#B28A47]/60
                  focus-visible:ring-offset-4
                  focus-visible:ring-offset-[#FFFDF8]
                "
              >
                <span>
                  Découvrir notre histoire
                </span>

                <span
                  className="
                    inline-flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-[#B28A47]/35

                    text-[#B28A47]

                    transition-all
                    duration-200

                    group-hover:translate-x-1
                    group-hover:border-[#B28A47]/55
                    group-hover:bg-[#B28A47]/5
                  "
                >
                  <ArrowRight
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          </motion.div>

          {/* =================================================
              IMAGE
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              mx-auto
              w-full
              max-w-[680px]
              lg:max-w-none
            "
          >
            {/* Cadre décoratif */}

            <div
              className="
                pointer-events-none
                absolute
                -right-4
                -top-4
                hidden
                h-full
                w-full
                rounded-[30px]
                border
                border-[#B28A47]/20
                lg:block
              "
              aria-hidden="true"
            />

            <div
              className="
                group/image
                relative
                aspect-[4/3]
                overflow-hidden
                rounded-[28px]
                border
                border-[#B28A47]/20
                bg-[#F6F1E8]
                shadow-[0_30px_80px_-45px_rgba(35,20,12,0.45)]
              "
            >
              <Image
                src="/images/about/riad-story.jpeg"
                alt="Architecture et ambiance de Dar LaMamy à Fès"
                fill
                sizes="
                  (max-width: 1024px) 100vw,
                  50vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover/image:scale-[1.025]
                "
              />

              {/* Overlay photo */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/55
                  via-black/5
                  to-transparent
                "
                aria-hidden="true"
              />

              {/* Glow chaud */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[radial-gradient(circle_at_75%_20%,rgba(210,170,90,0.10),transparent_45%)]
                "
                aria-hidden="true"
              />

              {/* Légende */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  p-5
                  sm:p-7
                "
              >
                <div
                  className="
                    max-w-[360px]
                    rounded-2xl
                    border
                    border-white/15
                    bg-black/20
                    px-5
                    py-4
                    text-white
                    shadow-[0_18px_40px_-25px_rgba(0,0,0,0.45)]
                    backdrop-blur-md
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.28em]
                      text-[#E8C982]
                    "
                  >
                    Maison d’hôtes
                  </p>

                  <h3
                    className="
                      mt-2
                      font-serif
                      text-2xl
                      font-medium
                      leading-tight
                      text-[#FFFDF8]
                    "
                  >
                    Notre maison
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-light
                      text-white/75
                    "
                  >
                    Une histoire de famille au cœur de Fès
                  </p>
                </div>
              </div>
            </div>

            {/* Petit détail décoratif */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-5
                left-10
                hidden
                items-center
                gap-3
                lg:flex
              "
              aria-hidden="true"
            >
              <span
                className="
                  h-px
                  w-16
                  bg-[#B28A47]/40
                "
              />

              <span
                className="
                  h-2
                  w-2
                  rotate-45
                  border
                  border-[#B28A47]/55
                "
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}