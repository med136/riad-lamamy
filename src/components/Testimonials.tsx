"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Quote,
  Star,
} from "lucide-react";

export type TestimonialItem = {
  id: number | string;
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  stay: string;
  featured?: boolean;
};

const defaultTestimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Sophie et Thomas",
    location: "Paris, France",
    date: "Janvier 2024",
    rating: 5,
    text:
      "Un séjour absolument magique. Le riad est encore plus beau qu’en photo. L’accueil est chaleureux, les chambres spacieuses et le petit-déjeuner était un vrai moment de plaisir.",
    avatar: "ST",
    stay: "7 nuits en Suite Royale",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    location: "Madrid, Espagne",
    date: "Décembre 2023",
    rating: 5,
    text:
      "Le service est exceptionnel. L’équipe a tout fait pour rendre notre voyage de noces inoubliable. Les attentions personnalisées et les recommandations étaient parfaites.",
    avatar: "MR",
    stay: "5 nuits en Chambre Deluxe",
    featured: true,
  },
  {
    id: 3,
    name: "James Wilson",
    location: "Londres, Royaume-Uni",
    date: "Novembre 2023",
    rating: 4,
    text:
      "Excellent séjour. L’emplacement est idéal pour explorer la médina et retrouver ensuite le calme du riad. Une adresse que nous recommandons volontiers.",
    avatar: "JW",
    stay: "4 nuits en Chambre Standard",
  },
  {
    id: 4,
    name: "Anna Schmidt",
    location: "Berlin, Allemagne",
    date: "Octobre 2023",
    rating: 5,
    text:
      "Une véritable oasis de paix au cœur de Fès. Le personnel est attentionné et l’atmosphère très agréable. Une expérience authentique et reposante.",
    avatar: "AS",
    stay: "6 nuits en Suite Royale",
  },
];

type TestimonialsProps = {
  items?: TestimonialItem[];
};

const AUTOPLAY_MS = 6500;

export function Testimonials({
  items: initialItems,
}: TestimonialsProps) {
  const [items, setItems] =
    useState<TestimonialItem[]>(
      initialItems &&
        initialItems.length
        ? initialItems
        : defaultTestimonials,
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [paused, setPaused] =
    useState(false);

  /* =========================================================
     FETCH
     ========================================================= */

  useEffect(() => {
    if (
      initialItems &&
      initialItems.length
    ) {
      return;
    }

    const controller =
      new AbortController();

    const fetchTestimonials =
      async () => {
        try {
          const res = await fetch(
            "/api/testimonials",
            {
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

          if (!res.ok) {
            throw new Error(
              "Failed to load testimonials",
            );
          }

          const payload =
            await res.json();

          const data =
            Array.isArray(
              payload?.data,
            )
              ? payload.data
              : [];

          const transformed =
            data.map(
              (
                testimonial: any,
                index: number,
              ) => {
                const name =
                  testimonial.guest_name ||
                  testimonial.name ||
                  "Client";

                const country =
                  testimonial.guest_country ||
                  testimonial.location ||
                  "";

                const created =
                  testimonial.created_at ||
                  new Date().toISOString();

                const date =
                  new Intl.DateTimeFormat(
                    "fr-FR",
                    {
                      month:
                        "long",
                      year:
                        "numeric",
                    },
                  ).format(
                    new Date(
                      created,
                    ),
                  );

                const initials =
                  name
                    .split(" ")
                    .filter(Boolean)
                    .map(
                      (
                        part: string,
                      ) =>
                        part[0],
                    )
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                return {
                  id:
                    testimonial.id ??
                    index,

                  name,

                  location:
                    country,

                  date,

                  rating:
                    Number(
                      testimonial.rating ??
                        5,
                    ),

                  text:
                    testimonial.content ||
                    testimonial.text ||
                    "",

                  avatar:
                    initials,

                  stay:
                    testimonial.stay ||
                    "",

                  featured:
                    Boolean(
                      testimonial.featured,
                    ),
                } satisfies TestimonialItem;
              },
            );

          if (
            transformed.length
          ) {
            setItems(
              transformed,
            );
          }
        } catch (error) {
          if (
            (error as Error)
              .name !==
            "AbortError"
          ) {
            console.error(
              "Testimonials loading failed:",
              error,
            );
          }
        }
      };

    void fetchTestimonials();

    return () => {
      controller.abort();
    };
  }, [initialItems]);

  /* =========================================================
     SAFETY
     ========================================================= */

  useEffect(() => {
    if (!items.length) {
      setCurrentIndex(0);
      return;
    }

    if (
      currentIndex >=
      items.length
    ) {
      setCurrentIndex(0);
    }
  }, [
    currentIndex,
    items.length,
  ]);

  /* =========================================================
     AUTOPLAY
     ========================================================= */

  useEffect(() => {
    if (
      paused ||
      items.length <= 1
    ) {
      return;
    }

    const id =
      window.setInterval(() => {
        setCurrentIndex(
          (previous) =>
            (previous + 1) %
            items.length,
        );
      }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [items.length, paused]);

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const nextTestimonial =
    () => {
      if (!items.length) {
        return;
      }

      setCurrentIndex(
        (previous) =>
          (previous + 1) %
          items.length,
      );
    };

  const prevTestimonial =
    () => {
      if (!items.length) {
        return;
      }

      setCurrentIndex(
        (previous) =>
          (previous -
            1 +
            items.length) %
          items.length,
      );
    };

  /* =========================================================
     STATS
     ========================================================= */

  const stats = useMemo(() => {
    if (!items.length) {
      return [];
    }

    const average =
      items.reduce(
        (sum, item) =>
          sum + item.rating,
        0,
      ) / items.length;

    const fiveStars =
      items.filter(
        (item) =>
          item.rating === 5,
      ).length;

    return [
      {
        value:
          average.toFixed(1),
        suffix: "/5",
        label:
          "Note moyenne",
      },
      {
        value:
          String(
            items.length,
          ),
        suffix: "",
        label:
          "Avis publiés",
      },
      {
        value:
          `${Math.round(
            (fiveStars /
              items.length) *
              100,
          )}%`,
        suffix: "",
        label:
          "Avis 5 étoiles",
      },
    ];
  }, [items]);

  const active =
    items[currentIndex];

  if (!active) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]
        py-16
        sm:py-20
        lg:py-24
      "
    >
      {/* Background */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_12%_18%,rgba(178,138,71,0.06),transparent_34%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_88%_75%,rgba(15,90,70,0.05),transparent_35%)]
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
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
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
                w-10
                bg-[#B28A47]/50
              "
            />

            <span
              className="
                inline-flex
                items-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B28A47]
              "
            >
              <Quote
                size={14}
                strokeWidth={1.5}
              />

              Témoignages
            </span>

            <span
              className="
                h-px
                w-10
                bg-[#B28A47]/50
              "
            />
          </div>

          <h2
            className="
              font-serif
              text-[2.5rem]
              font-medium
              leading-[1.05]
              tracking-[-0.025em]
              text-[#201A17]
              sm:text-[3rem]
              lg:text-[3.35rem]
            "
          >
            Ce que disent
            <span className="text-[#0F5A46]">
              {" "}
              nos voyageurs
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-[15px]
              font-light
              leading-[1.75]
              text-gray-600
              sm:text-[16px]
            "
          >
            Des expériences
            authentiques,
            racontées par celles et
            ceux qui ont séjourné à
            Dar LaMamy.
          </p>
        </motion.div>

        {/* STATS */}

        <div
          className="
            mx-auto
            mb-10
            grid
            max-w-4xl
            grid-cols-1
            gap-3
            sm:grid-cols-3
          "
        >
          {stats.map(
            (stat, index) => (
              <motion.div
                key={
                  stat.label
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
                }}
                transition={{
                  duration: 0.45,
                  delay:
                    index *
                    0.06,
                }}
                className="
                  rounded-[20px]
                  border
                  border-[#B28A47]/15
                  bg-white/70
                  px-5
                  py-5
                  text-center
                  shadow-[0_12px_35px_-28px_rgba(35,20,12,0.25)]
                  backdrop-blur-sm
                "
              >
                <p
                  className="
                    font-serif
                    text-[28px]
                    font-medium
                    leading-none
                    text-[#0F5A46]
                  "
                >
                  {stat.value}

                  <span
                    className="
                      ml-0.5
                      text-lg
                      text-[#B28A47]
                    "
                  >
                    {
                      stat.suffix
                    }
                  </span>
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-500
                    sm:text-[13px]
                  "
                >
                  {
                    stat.label
                  }
                </p>
              </motion.div>
            ),
          )}
        </div>

        {/* MAIN TESTIMONIAL */}

        <div
          className="
            relative
            mx-auto
            max-w-5xl
          "
          onMouseEnter={() =>
            setPaused(true)
          }
          onMouseLeave={() =>
            setPaused(false)
          }
        >
          {/* Navigation */}

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={
                  prevTestimonial
                }
                aria-label="Témoignage précédent"
                className="
                  absolute
                  left-0
                  top-1/2
                  z-20
                  inline-flex
                  h-11
                  w-11
                  -translate-x-3
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#B28A47]/20
                  bg-[#FFFDF8]/95
                  text-[#0F5A46]
                  shadow-[0_8px_24px_rgba(35,20,12,0.14)]
                  backdrop-blur
                  transition-all
                  duration-200
                  hover:-translate-x-4
                  hover:border-[#B28A47]/40
                  hover:bg-white
                  md:-translate-x-14
                  md:hover:-translate-x-[60px]
                "
              >
                <ChevronLeft
                  size={20}
                  strokeWidth={1.7}
                />
              </button>

              <button
                type="button"
                onClick={
                  nextTestimonial
                }
                aria-label="Témoignage suivant"
                className="
                  absolute
                  right-0
                  top-1/2
                  z-20
                  inline-flex
                  h-11
                  w-11
                  translate-x-3
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#B28A47]/20
                  bg-[#FFFDF8]/95
                  text-[#0F5A46]
                  shadow-[0_8px_24px_rgba(35,20,12,0.14)]
                  backdrop-blur
                  transition-all
                  duration-200
                  hover:translate-x-4
                  hover:border-[#B28A47]/40
                  hover:bg-white
                  md:translate-x-14
                  md:hover:translate-x-[60px]
                "
              >
                <ChevronRight
                  size={20}
                  strokeWidth={1.7}
                />
              </button>
            </>
          )}

          <motion.article
            key={active.id}
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
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
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-[#B28A47]/20
              bg-white/80
              p-6
              shadow-[0_28px_80px_-50px_rgba(35,20,12,0.38)]
              backdrop-blur-md
              sm:p-8
              md:p-10
            "
          >
            {/* subtle decorative glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-60
                w-60
                rounded-full
                bg-[#0F5A46]/5
                blur-3xl
              "
              aria-hidden="true"
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-24
                h-56
                w-56
                rounded-full
                bg-[#B28A47]/5
                blur-3xl
              "
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* TOP */}

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-center
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#B28A47]/30
                    bg-[#0F5A46]
                    font-serif
                    text-lg
                    font-medium
                    text-[#FFFDF8]
                    shadow-[0_8px_22px_rgba(15,90,70,0.16)]
                  "
                >
                  {
                    active.avatar
                  }
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      flex
                      flex-col
                      gap-2
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div>
                      <h3
                        className="
                          font-serif
                          text-[24px]
                          font-medium
                          leading-tight
                          text-[#201A17]
                        "
                      >
                        {
                          active.name
                        }
                      </h3>

                      <div
                        className="
                          mt-2
                          flex
                          flex-wrap
                          gap-x-4
                          gap-y-1
                          text-xs
                          text-gray-500
                        "
                      >
                        {active.location && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                            "
                          >
                            <MapPin
                              size={
                                13
                              }
                              strokeWidth={
                                1.6
                              }
                              className="text-[#B28A47]"
                            />

                            {
                              active.location
                            }
                          </span>
                        )}

                        {active.date && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                            "
                          >
                            <Calendar
                              size={
                                13
                              }
                              strokeWidth={
                                1.6
                              }
                              className="text-[#B28A47]"
                            />

                            {
                              active.date
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stars */}

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                      "
                      aria-label={`${active.rating} étoiles sur 5`}
                    >
                      {Array.from({
                        length: 5,
                      }).map(
                        (
                          _,
                          index,
                        ) => (
                          <Star
                            key={
                              index
                            }
                            size={
                              17
                            }
                            strokeWidth={
                              1.4
                            }
                            className={
                              index <
                              active.rating
                                ? "fill-[#D2AA5A] text-[#D2AA5A]"
                                : "text-[#B28A47]/20"
                            }
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QUOTE */}

              <div
                className="
                  mt-8
                  border-t
                  border-[#B28A47]/12
                  pt-7
                "
              >
                <Quote
                  size={30}
                  strokeWidth={1.2}
                  className="
                    mb-4
                    text-[#B28A47]/45
                  "
                  aria-hidden="true"
                />

                <blockquote
                  className="
                    max-w-4xl
                    font-serif
                    text-[20px]
                    font-normal
                    leading-[1.7]
                    text-[#201A17]/85
                    sm:text-[22px]
                    md:text-[24px]
                  "
                >
                  “{active.text}”
                </blockquote>
              </div>

              {/* STAY */}

              {active.stay && (
                <div className="mt-7">
                  <span
                    className="
                      inline-flex
                      rounded-full
                      border
                      border-[#B28A47]/20
                      bg-[#B28A47]/5
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-[#0F5A46]
                    "
                  >
                    {
                      active.stay
                    }
                  </span>
                </div>
              )}

              {/* FEATURED */}

              {active.featured && (
                <div
                  className="
                    absolute
                    right-0
                    top-0
                    rounded-bl-2xl
                    bg-[#0F5A46]
                    px-4
                    py-2
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#E8C982]
                  "
                >
                  Coup de cœur
                </div>
              )}
            </div>
          </motion.article>

          {/* DOTS */}

          {items.length > 1 && (
            <div
              className="
                mt-6
                flex
                justify-center
                gap-2
              "
            >
              {items.map(
                (
                  _,
                  index,
                ) => (
                  <button
                    key={
                      index
                    }
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        index,
                      )
                    }
                    aria-label={`Afficher le témoignage ${
                      index + 1
                    }`}
                    className={`
                      h-[5px]
                      rounded-full
                      transition-all
                      duration-200

                      ${
                        index ===
                        currentIndex
                          ? "w-8 bg-[#0F5A46]"
                          : "w-[5px] bg-[#B28A47]/25 hover:bg-[#B28A47]/55"
                      }
                    `}
                  />
                ),
              )}
            </div>
          )}
        </div>

        {/* TRUST / EXTERNAL REVIEWS */}

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
            mx-auto
            mt-12
            max-w-4xl
            text-center
          "
        >
          <p
            className="
              text-sm
              font-light
              text-gray-500
            "
          >
            Retrouvez également les
            avis vérifiés de nos
            voyageurs sur les
            principales plateformes
            de réservation.
          </p>

          <div
            className="
              mt-5
              flex
              flex-wrap
              justify-center
              gap-x-6
              gap-y-3
            "
          >
            {[
              "Booking.com",
              "Google",
              "TripAdvisor",
              "Airbnb",
            ].map(
              (platform) => (
                <span
                  key={
                    platform
                  }
                  className="
                    text-sm
                    font-semibold
                    tracking-[0.01em]
                    text-[#201A17]/60
                  "
                >
                  {
                    platform
                  }
                </span>
              ),
            )}
          </div>

          {/* CTA */}

          <div className="mt-8">
            <a
              href="/temoignage"
              className="
                group
                inline-flex
                h-[50px]
                items-center
                justify-center
                rounded-full
                border
                border-[#B28A47]/30
                bg-[#FFFDF8]
                px-7
                text-sm
                font-semibold
                text-[#0F5A46]
                shadow-[0_8px_24px_rgba(35,20,12,0.08)]
                transition-all
                duration-200
                hover:-translate-y-px
                hover:border-[#B28A47]/50
                hover:bg-white
                hover:shadow-[0_10px_28px_rgba(35,20,12,0.12)]
              "
            >
              Laisser un avis
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}