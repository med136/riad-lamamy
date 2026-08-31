"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react";

import Image from "next/image";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Car,
  Clock,
  Coffee,
  Heart,
  Music,
  Shield,
  Sparkles,
  Umbrella,
  Wifi,
  Wine,
} from "lucide-react";

type ApiService = {
  id: string | number;
  name: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  duration_minutes?: number | null;
  is_active?: boolean;
  display_order?: number | null;
};

type UiService = {
  id: string | number;
  icon: ElementType;
  title: string;
  description: string;
  price?: number | null;
};

const fallbackServices: UiService[] = [
  {
    id: "breakfast",
    icon: Coffee,
    title: "Petit-déjeuner marocain",
    description:
      "Un petit-déjeuner généreux aux saveurs marocaines, servi dans le calme du riad.",
  },
  {
    id: "wifi",
    icon: Wifi,
    title: "Wi-Fi haut débit",
    description:
      "Une connexion internet disponible gratuitement dans les chambres et les espaces communs.",
  },
  {
    id: "transfer",
    icon: Car,
    title: "Transfert privé",
    description:
      "Service de transfert privé depuis et vers l’aéroport de Fès-Saïss.",
  },
  {
    id: "excursions",
    icon: Umbrella,
    title: "Découverte de Fès",
    description:
      "Visites et expériences personnalisées pour découvrir la médina et ses environs.",
  },
  {
    id: "dinner",
    icon: Wine,
    title: "Dîner marocain",
    description:
      "Une expérience culinaire autour de recettes marocaines préparées avec attention.",
  },
  {
    id: "music",
    icon: Music,
    title: "Expériences sur mesure",
    description:
      "Des attentions et expériences organisées selon vos envies pour personnaliser votre séjour.",
  },
];

const highlights = [
  {
    icon: Sparkles,
    text: "Service personnalisé",
  },
  {
    icon: Shield,
    text: "Discrétion et sérénité",
  },
  {
    icon: Heart,
    text: "Attention aux détails",
  },
  {
    icon: Clock,
    text: "Grande flexibilité",
  },
];

export function Services() {
  const [services, setServices] =
    useState<ApiService[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================================================
     FETCH
     ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const load = async () => {
      try {
        const res = await fetch(
          "/api/services",
          {
            cache: "no-store",
            signal:
              controller.signal,
          },
        );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

        const items =
          Array.isArray(
            data?.services,
          )
            ? (data.services as ApiService[])
            : [];

        if (items.length) {
          setServices(items);
        }
      } catch (error) {
        if (
          (error as Error)
            .name !==
          "AbortError"
        ) {
          console.error(
            "Error loading services:",
            error,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  /* =========================================================
     NORMALISATION
     ========================================================= */

  const dynamicServices =
    useMemo<UiService[]>(
      () => {
        if (!services.length) {
          return [];
        }

        const normalize = (
          value: string,
        ) =>
          value
            .toLowerCase()
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              "",
            );

        const pickIcon = (
          categoryRaw?: string | null,
        ): ElementType => {
          const category =
            categoryRaw
              ? normalize(
                  categoryRaw,
                )
              : "";

          if (
            category.includes(
              "restauration",
            )
          ) {
            return Coffee;
          }

          if (
            category.includes(
              "transport",
            )
          ) {
            return Car;
          }

          if (
            category.includes(
              "spa",
            )
          ) {
            return Sparkles;
          }

          if (
            category.includes(
              "activite",
            )
          ) {
            return Umbrella;
          }

          if (
            category.includes(
              "sur_mesure",
            ) ||
            category.includes(
              "sur mesure",
            )
          ) {
            return Music;
          }

          return Wifi;
        };

        return services
          .filter((service) =>
            typeof service.is_active ===
            "boolean"
              ? service.is_active
              : true,
          )
          .sort(
            (a, b) =>
              (a.display_order ??
                999) -
              (b.display_order ??
                999),
          )
          .slice(0, 6)
          .map(
            (
              service,
              index,
            ) => ({
              id:
                service.id ??
                index,

              icon: pickIcon(
                service.category,
              ),

              title:
                service.name ||
                "Service",

              description:
                (
                  service.description ||
                  "Un service pensé pour rendre votre séjour encore plus agréable."
                ).trim(),

              price:
                typeof service.price ===
                "number"
                  ? service.price
                  : null,
            }),
          );
      },
      [services],
    );

  const displayServices =
    dynamicServices.length
      ? dynamicServices
      : fallbackServices;

  const gridItems: Array<
    UiService | null
  > = loading
    ? Array.from(
        {
          length: 6,
        },
        () => null,
      )
    : displayServices;

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]
        py-14
        sm:py-16
        lg:py-20
      "
    >
      {/* Background */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_10%_18%,rgba(178,138,71,0.05),transparent_32%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_90%_76%,rgba(15,90,70,0.04),transparent_34%)]
        "
        aria-hidden="true"
      />

      <div className="site-container relative">
        {/* ===================================================
            HEADER
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
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
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            mx-auto
            mb-9
            max-w-3xl
            text-center
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <span className="h-px w-9 bg-[#B28A47]/45" />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B28A47]
              "
            >
              Nos services
            </span>

            <span className="h-px w-9 bg-[#B28A47]/45" />
          </div>

          <h2
            className="
              font-serif
              text-[2.4rem]
              font-medium
              leading-[1.05]
              tracking-[-0.025em]
              text-[#201A17]
              sm:text-[2.85rem]
              lg:text-[3.15rem]
            "
          >
            Des attentions pensées
            <span className="text-[#0F5A46]">
              {" "}
              pour votre séjour
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-[14px]
              font-light
              leading-[1.7]
              text-gray-600
              sm:text-[15px]
            "
          >
            De votre arrivée à vos
            découvertes dans Fès,
            notre équipe veille à
            rendre chaque moment
            simple et agréable.
          </p>
        </motion.div>

        {/* ===================================================
            SERVICES GRID
            =================================================== */}

{/* ===================================================
    SERVICES GRID — PREMIUM / CARDS EMPHASIS
    =================================================== */}

<div
  className="
    mb-12
    grid
    grid-cols-1
    gap-5
    sm:grid-cols-2
    lg:grid-cols-3
  "
>
  {gridItems.map((service, index) => (
    <motion.article
      key={service?.id ?? index}
      initial={{
        opacity: 0,
        y: 22,
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
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        group
        relative
        overflow-hidden

        rounded-[24px]

        border
        border-[#B28A47]/30

        bg-white

        p-6

        shadow-[0_18px_50px_-28px_rgba(35,20,12,0.28)]

        transition-all
        duration-300
        ease-out

        hover:-translate-y-1.5
        hover:border-[#B28A47]/55
        hover:shadow-[0_28px_70px_-30px_rgba(15,90,70,0.25)]

        sm:p-7
      "
    >
      {!service ? (
        <div className="animate-pulse">
          <div className="mb-5 h-14 w-14 rounded-2xl bg-[#0F5A46]/10" />

          <div className="h-6 w-2/3 rounded bg-gray-200" />

          <div className="mt-4 h-4 w-full rounded bg-gray-100" />

          <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />

          <div className="mt-6 h-px w-full bg-[#B28A47]/10" />

          <div className="mt-4 h-4 w-1/3 rounded bg-[#0F5A46]/10" />
        </div>
      ) : (
        <>
          {(() => {
            const Icon = service.icon;

            return (
              <>
                {/* Top decorative glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-16
                    -top-20
                    h-44
                    w-44
                    rounded-full
                    bg-[#0F5A46]/5
                    blur-3xl
                    transition-all
                    duration-300
                    group-hover:bg-[#0F5A46]/9
                  "
                  aria-hidden="true"
                />

                {/* Gold top accent */}

                <div
                  className="
                    absolute
                    left-6
                    right-6
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-[#B28A47]/60
                    to-transparent
                  "
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  {/* Icon */}

                  <div
                    className="
                      mb-5
                      inline-flex
                      h-14
                      w-14
                      items-center
                      justify-center

                      rounded-2xl

                      border
                      border-[#B28A47]/35

                      bg-[#0F5A46]

                      text-[#E8C982]

                      shadow-[0_8px_22px_rgba(15,90,70,0.18)]

                      transition-all
                      duration-300

                      group-hover:scale-[1.04]
                      group-hover:border-[#D2AA5A]/60
                    "
                  >
                    <Icon
                      size={23}
                      strokeWidth={1.6}
                    />
                  </div>

                  {/* Small label */}

                  <div
                    className="
                      mb-2
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-[#B28A47]
                    "
                  >
                    Service Dar LaMamy
                  </div>

                  {/* Title */}

                  <h3
                    className="
                      font-serif
                      text-[23px]
                      font-medium
                      leading-[1.15]
                      tracking-[-0.015em]
                      text-[#201A17]

                      transition-colors
                      duration-300

                      group-hover:text-[#0F5A46]
                    "
                  >
                    {service.title}
                  </h3>

                  {/* Description */}

                  <p
                    className="
                      mt-3
                      min-h-[68px]
                      text-[14px]
                      font-light
                      leading-[1.7]
                      text-gray-600
                    "
                  >
                    {service.description}
                  </p>

                  {/* Divider */}

                  <div
                    className="
                      my-5
                      h-px
                      bg-gradient-to-r
                      from-[#B28A47]/25
                      via-[#B28A47]/12
                      to-transparent
                    "
                  />

                  {/* Bottom */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <span
                      className="
                        font-serif
                        text-[15px]
                        font-medium
                        text-[#0F5A46]
                      "
                    >
                      {typeof service.price === "number" &&
                      service.price > 0
                        ? `À partir de ${service.price.toLocaleString(
                            "fr-FR",
                          )} MAD`
                        : "Sur demande"}
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
                        border-[#B28A47]/30

                        text-[#B28A47]

                        transition-all
                        duration-200

                        group-hover:translate-x-1
                        group-hover:border-[#B28A47]/55
                        group-hover:bg-[#B28A47]/5
                      "
                    >
                      <ArrowRight
                        size={14}
                        strokeWidth={1.7}
                      />
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}
    </motion.article>
  ))}
</div>

        {/* ===================================================
            WHY CHOOSE US
            =================================================== */}

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
            amount: 0.2,
          }}
          transition={{
            duration: 0.6,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-[#B28A47]/25
            bg-[#0F5A46]
            px-6
            py-8
            text-[#FFFDF8]
            shadow-[0_24px_70px_-45px_rgba(15,90,70,0.5)]
            sm:px-8
            lg:px-10
            lg:py-9
          "
        >
          {/* zellij image */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden
            "
            aria-hidden="true"
          >
            <Image
              src="/patterns/riad-zellij-overlay.png"
              alt=""
              fill
              sizes="100vw"
              className="
                object-cover
                object-center
                opacity-[0.10]
                mix-blend-soft-light
                select-none
              "
            />
          </div>

          {/* center soft mask */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(ellipse_at_center,rgba(15,90,70,0.28)_0%,rgba(15,90,70,0.12)_45%,transparent_75%)]
            "
            aria-hidden="true"
          />

          {/* glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              bg-[#D2AA5A]/7
              blur-3xl
            "
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-5xl">
            {/* header */}

            <div className="text-center">
              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-center
                  gap-3
                "
              >
                <span className="h-px w-8 bg-[#D2AA5A]/55" />

                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-[#E8C982]
                  "
                >
                  L’expérience Dar LaMamy
                </span>

                <span className="h-px w-8 bg-[#D2AA5A]/55" />
              </div>

              <h3
                className="
                  font-serif
                  text-[28px]
                  font-medium
                  tracking-[-0.02em]
                  text-[#FFFDF8]
                  sm:text-[32px]
                "
              >
                Pourquoi nous choisir ?
              </h3>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-2xl
                  text-[13px]
                  font-light
                  leading-relaxed
                  text-white/65
                  sm:text-[14px]
                "
              >
                Une maison d’hôtes
                attentive à chaque
                détail de votre séjour.
              </p>
            </div>

            {/* highlights */}

            <div
              className="
                mt-7
                grid
                grid-cols-2
                gap-3
                lg:grid-cols-4
              "
            >
              {highlights.map(
                (
                  highlight,
                  index,
                ) => {
                  const Icon =
                    highlight.icon;

                  return (
                    <motion.div
                      key={
                        highlight.text
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration:
                          0.4,
                        delay:
                          index *
                          0.05,
                      }}
                      className="
                        group
                        flex
                        min-h-[125px]
                        flex-col
                        items-center
                        justify-center
                        rounded-[18px]
                        border
                        border-white/10
                        bg-white/[0.055]
                        px-4
                        py-5
                        text-center
                        backdrop-blur-sm
                        transition-all
                        duration-200
                        hover:border-[#D2AA5A]/30
                        hover:bg-white/[0.075]
                      "
                    >
                      <div
                        className="
                          mb-3
                          inline-flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-[#D2AA5A]/25
                          bg-white/[0.05]
                          text-[#E8C982]
                        "
                      >
                        <Icon
                          size={18}
                          strokeWidth={
                            1.6
                          }
                        />
                      </div>

                      <span
                        className="
                          max-w-[170px]
                          text-[12px]
                          font-semibold
                          leading-relaxed
                          text-[#FFFDF8]
                          sm:text-[13px]
                        "
                      >
                        {
                          highlight.text
                        }
                      </span>
                    </motion.div>
                  );
                },
              )}
            </div>

            <div
              className="
                mx-auto
                mt-7
                max-w-2xl
                border-t
                border-[#D2AA5A]/18
                pt-5
                text-center
              "
            >
              <p
                className="
                  font-serif
                  text-[17px]
                  font-normal
                  leading-relaxed
                  text-white/80
                  sm:text-[18px]
                "
              >
                Notre équipe reste
                attentive à vos envies
                pour rendre votre
                séjour unique.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ===================================================
            CTA
            =================================================== */}

        <motion.div
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
          }}
          className="
            mt-8
            text-center
          "
        >
          <p
            className="
              mx-auto
              mb-5
              max-w-xl
              text-[13px]
              font-light
              leading-relaxed
              text-gray-600
              sm:text-[14px]
            "
          >
            Une demande particulière ?
            Notre conciergerie est à
            votre disposition.
          </p>

          <a
            href="/contact"
            className="
              group
              inline-flex
              h-[50px]
              items-center
              justify-center
              gap-3
              rounded-full
              border
              border-[#B28A47]/35
              bg-[#0F5A46]
              px-7
              text-[13px]
              font-semibold
              text-[#FFFDF8]
              shadow-[0_8px_24px_rgba(15,90,70,0.17)]
              transition-all
              duration-200
              hover:-translate-y-px
              hover:bg-[#12604B]
              hover:shadow-[0_11px_28px_rgba(15,90,70,0.22)]
            "
          >
            Demander un service personnalisé

            <ArrowRight
              size={16}
              strokeWidth={1.7}
              className="
                text-[#D2AA5A]
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}