"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  Car,
  Check,
  Map as MapIcon,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ServiceItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  duration_minutes: number | null;
};

type DisplayService = {
  icon: LucideIcon;
  title: string;
  description: string;
  included: boolean;
  price?: string;
  duration?: number;
};

type DisplayCategory = {
  category: string;
  items: DisplayService[];
};

const fallbackServices: DisplayCategory[] = [
  {
    category: "La table",
    items: [
      {
        icon: Utensils,
        title: "Petit-déjeuner marocain",
        description:
          "Un moment gourmand inspiré des saveurs locales, selon l’organisation de votre séjour.",
        included: false,
      },
      {
        icon: Utensils,
        title: "Repas sur demande",
        description:
          "Des plats marocains peuvent être organisés sur réservation et selon disponibilité.",
        included: false,
      },
    ],
  },
  {
    category: "Déplacements",
    items: [
      {
        icon: Car,
        title: "Transfert",
        description:
          "Notre équipe peut vous aider à organiser votre arrivée ou votre départ.",
        included: false,
      },
    ],
  },
  {
    category: "Découvrir Fès",
    items: [
      {
        icon: MapIcon,
        title: "Visite de la médina",
        description:
          "Nous pouvons vous orienter vers des visites et expériences adaptées à vos envies.",
        included: false,
      },
    ],
  },
  {
    category: "Sur mesure",
    items: [
      {
        icon: Camera,
        title: "Expérience personnalisée",
        description:
          "Une occasion particulière ou une demande spécifique ? Parlez-nous de votre projet.",
        included: false,
      },
    ],
  },
];

function iconForCategory(category: string): LucideIcon {
  const key = category.toLowerCase();

  if (
    key.includes("resta") ||
    key.includes("table") ||
    key.includes("repas")
  ) {
    return Utensils;
  }

  if (
    key.includes("trans") ||
    key.includes("aeroport") ||
    key.includes("aéroport")
  ) {
    return Car;
  }

  if (
    key.includes("activ") ||
    key.includes("excurs") ||
    key.includes("visite")
  ) {
    return MapIcon;
  }

  if (key.includes("photo")) {
    return Camera;
  }

  return Sparkles;
}

function categorySubtitle(category: string) {
  const key = category.toLowerCase();

  if (
    key.includes("resta") ||
    key.includes("table") ||
    key.includes("repas")
  ) {
    return "Saveurs & moments à partager";
  }

  if (
    key.includes("trans") ||
    key.includes("aeroport") ||
    key.includes("aéroport") ||
    key.includes("déplacement")
  ) {
    return "Arriver et se déplacer en toute sérénité";
  }

  if (
    key.includes("activ") ||
    key.includes("excurs") ||
    key.includes("visite") ||
    key.includes("fès")
  ) {
    return "Explorer Fès autrement";
  }

  if (
    key.includes("sur mesure") ||
    key.includes("personnalis")
  ) {
    return "Des attentions pensées pour vous";
  }

  return "Pensé autour de votre séjour";
}

export function ServiceList() {
  const [remoteServices, setRemoteServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch("/api/services", {
          signal: controller.signal,
          cache: "no-store",
        });

        const json = await response.json();

        if (
          response.ok &&
          Array.isArray(json.services)
        ) {
          setRemoteServices(json.services);
        }
      } catch (error) {
        if (
          (error as Error).name !==
          "AbortError"
        ) {
          // fallback statique volontaire
        }
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  const dynamicCategories = useMemo<DisplayCategory[]>(
    () => {
      if (!remoteServices.length) {
        return [];
      }

      const groups =
        new globalThis.Map<
          string,
          DisplayService[]
        >();

      for (const service of remoteServices) {
        const category =
          service.category || "Autres";

        const items =
          groups.get(category) ?? [];

        items.push({
          icon: iconForCategory(category),
          title: service.name,
          description:
            service.description ||
            "Informations disponibles sur demande.",
          included:
            Number(service.price || 0) === 0,
          price:
            Number(service.price || 0) > 0
              ? `${Number(
                  service.price,
                ).toLocaleString(
                  "fr-FR",
                )} EUR`
              : undefined,
          duration:
            service.duration_minutes ||
            undefined,
        });

        groups.set(
          category,
          items,
        );
      }

      return Array.from(
        groups.entries(),
      ).map(
        ([category, items]) => ({
          category,
          items,
        }),
      );
    },
    [remoteServices],
  );

  const categories =
    dynamicCategories.length > 0
      ? dynamicCategories
      : fallbackServices;

  return (
    <section className="mb-14">
      {/* =====================================================
          MAIN INTRO
          ===================================================== */}

      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.30em]
            text-[#B28A47]
          "
        >
          À votre disposition
        </p>

        <div
          className="
            mx-auto
            mt-3
            flex
            w-[120px]
            items-center
          "
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-[#B28A47]/45" />

          <span
            className="
              mx-3
              h-[6px]
              w-[6px]
              rotate-45
              border
              border-[#B28A47]
            "
          />

          <span className="h-px flex-1 bg-[#B28A47]/45" />
        </div>

        <h2
          className="
            mt-5
            font-serif
            text-[32px]
            font-medium
            leading-tight
            text-[#2B1C17]
            sm:text-[38px]
          "
        >
          Des services pensés autour
          de votre séjour
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-xl
            text-[14px]
            leading-6
            text-[#6F625C]
            sm:text-[15px]
          "
        >
          Quelques attentions utiles,
          à organiser selon vos
          besoins et les
          disponibilités.
        </p>
      </div>

      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading &&
      remoteServices.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(
            (item) => (
              <div
                key={item}
                className="
                  h-36
                  animate-pulse
                  rounded-[20px]
                  bg-[#F8F5EF]
                "
              />
            ),
          )}
        </div>
      ) : (
        <div className="space-y-14">
          {categories.map(
            (
              category,
              categoryIndex,
            ) => (
              <motion.section
                key={
                  category.category
                }
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
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.35,
                  delay:
                    categoryIndex *
                    0.04,
                }}
              >
                {/* ===========================================
                    CATEGORY TITLE — NEW DESIGN
                    =========================================== */}

                <div className="mb-6">
                  <div
                    className="
                      flex
                      items-start
                      gap-4
                    "
                  >
                    {/* NUMBER */}

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#B28A47]/30
                        bg-[#F8F5EF]
                        text-[11px]
                        font-semibold
                        tracking-[0.08em]
                        text-[#0F5A46]
                      "
                      aria-hidden="true"
                    >
                      {String(
                        categoryIndex +
                          1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </div>

                    {/* TITLE */}

                    <div className="min-w-0">
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.24em]
                          text-[#B28A47]
                        "
                      >
                        Services Dar LaMamy
                      </p>

                      <h3
                        className="
                          mt-1
                          font-serif
                          text-[27px]
                          font-medium
                          leading-[1.05]
                          text-[#2B1C17]
                          sm:text-[30px]
                        "
                      >
                        {
                          category.category
                        }
                      </h3>

                      <p
                        className="
                          mt-1.5
                          text-[13px]
                          leading-5
                          text-[#6F625C]
                        "
                      >
                        {categorySubtitle(
                          category.category,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* PREMIUM DIVIDER */}

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-3
                    "
                    aria-hidden="true"
                  >
                    <span className="h-px w-12 bg-[#B28A47]/40" />

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rotate-45
                        bg-[#B28A47]/70
                      "
                    />

                    <span className="h-px flex-1 bg-[#B28A47]/15" />
                  </div>
                </div>

                {/* ===========================================
                    SERVICE CARDS
                    =========================================== */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  {category.items.map(
                    (
                      service,
                      serviceIndex,
                    ) => {
                      const Icon =
                        service.icon;

                      return (
                        <motion.article
                          key={`${category.category}-${service.title}-${serviceIndex}`}
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
                            duration: 0.3,
                            delay:
                              serviceIndex *
                              0.04,
                          }}
                          className="
                            rounded-[20px]
                            border
                            border-[#B28A47]/15
                            bg-[#FFFDF8]
                            p-5
                            transition-all
                            duration-200
                            hover:-translate-y-px
                            hover:border-[#B28A47]/30
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-4
                            "
                          >
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#B28A47]/20
                                bg-[#F8F5EF]
                              "
                            >
                              <Icon
                                className="
                                  h-4
                                  w-4
                                  text-[#0F5A46]
                                "
                                strokeWidth={
                                  1.6
                                }
                              />
                            </div>

                            {service.included ? (
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  border
                                  border-[#0F5A46]/15
                                  bg-[#0F5A46]/5
                                  px-2.5
                                  py-1
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.12em]
                                  text-[#0F5A46]
                                "
                              >
                                <Check className="h-3 w-3" />

                                Inclus
                              </span>
                            ) : service.price ? (
                              <span
                                className="
                                  text-[12px]
                                  font-semibold
                                  text-[#0F5A46]
                                "
                              >
                                {
                                  service.price
                                }
                              </span>
                            ) : null}
                          </div>

                          <h4
                            className="
                              mt-4
                              text-[15px]
                              font-semibold
                              text-[#2B1C17]
                            "
                          >
                            {
                              service.title
                            }
                          </h4>

                          <p
                            className="
                              mt-2
                              text-[13px]
                              leading-5
                              text-[#6F625C]
                            "
                          >
                            {
                              service.description
                            }
                          </p>

                          {service.duration ? (
                            <p
                              className="
                                mt-3
                                text-[11px]
                                text-[#6F625C]/75
                              "
                            >
                              Durée indicative
                              :{" "}
                              {
                                service.duration
                              }{" "}
                              min
                            </p>
                          ) : null}
                        </motion.article>
                      );
                    },
                  )}
                </div>
              </motion.section>
            ),
          )}
        </div>
      )}

      {/* =====================================================
          CTA
          ===================================================== */}

      <div
        className="
          mt-12
          rounded-[22px]
          bg-[#0F5A46]
          px-6
          py-7
          text-[#FFFDF8]
          sm:flex
          sm:items-center
          sm:justify-between
          sm:gap-8
          sm:px-8
        "
      >
        <div>
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.24em]
              text-[#D2AA5A]
            "
          >
            Une demande particulière ?
          </p>

          <p
            className="
              mt-2
              font-serif
              text-[25px]
              font-medium
            "
          >
            Notre équipe vous aide à
            préparer votre séjour.
          </p>
        </div>

        <Link
          href="/contact"
          className="
            mt-5
            inline-flex
            h-11
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#D2AA5A]/50
            px-5
            text-[13px]
            font-semibold
            transition
            hover:bg-[#FFFDF8]
            hover:text-[#0F5A46]
            sm:mt-0
          "
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
}