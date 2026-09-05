"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";

import {
  ArrowRight,
  Bed,
  Heart,
  Users,
} from "lucide-react";

interface RoomImage {
  url?: string;
  image_url?: string;
  src?: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;

  images?:
    | string[]
    | RoomImage[];

  image_url?: string | null;
  cover_image?: string | null;
  featured_image?: string | null;

  popular?: boolean;
  luxury?: boolean;
}

export function RoomPreview() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH
     ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const fetchRooms = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/rooms", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Unable to load rooms");
        }

        const data = await res.json();

        const nextRooms: Room[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.rooms)
              ? data.rooms
              : [];

        setRooms(nextRooms.slice(0, 3));
      } catch (error) {
        if (
          (error as Error).name !==
          "AbortError"
        ) {
          console.error(
            "Error fetching rooms:",
            error,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchRooms();

    return () => {
      controller.abort();
    };
  }, []);

  /* =========================================================
     IMAGE NORMALIZATION
     ========================================================= */

  const getRoomImage = (room: Room) => {
    if (room.cover_image) {
      return room.cover_image;
    }

    if (room.featured_image) {
      return room.featured_image;
    }

    if (room.image_url) {
      return room.image_url;
    }

    if (
      Array.isArray(room.images) &&
      room.images.length > 0
    ) {
      const first = room.images[0];

      if (typeof first === "string") {
        return first;
      }

      if (
        typeof first === "object" &&
        first !== null
      ) {
        return (
          first.url ||
          first.image_url ||
          first.src ||
          null
        );
      }
    }

    return null;
  };

  /* =========================================================
     FAVORITES
     ========================================================= */

  const toggleFavorite = (
    id: string,
  ) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter(
            (favorite) =>
              favorite !== id,
          )
        : [...current, id],
    );
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <section
        className="
          bg-[#FFFDF8]
          py-12
          sm:py-14
          lg:py-16
        "
      >
        <div className="site-container">
          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-3
            "
          >
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-[#B28A47]/10
                  bg-white
                  animate-pulse
                "
              >
                <div
                  className="
                    aspect-[16/11]
                    bg-[#B28A47]/10
                  "
                />

                <div className="space-y-3 p-5">
                  <div className="h-6 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]
        py-12
        sm:py-14
        lg:py-16
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_10%_18%,rgba(178,138,71,0.045),transparent_30%)]
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
            mb-8
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
            <span className="h-px w-8 bg-[#B28A47]/45" />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-[#B28A47]
              "
            >
              {t("home.rooms.kicker")}
            </span>

            <span className="h-px w-8 bg-[#B28A47]/45" />
          </div>

          <h2
            className="
              font-serif
              text-[2.3rem]
              font-medium
              leading-[1.05]
              tracking-[-0.025em]
              text-[#201A17]
              sm:text-[2.8rem]
              lg:text-[3rem]
            "
          >
            {t("home.rooms.title_before")}
            <span className="text-[#0F5A46]">
              {" "}
              {t("home.rooms.title_accent")}
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-2xl
              text-[14px]
              font-light
              leading-[1.7]
              text-gray-600
              sm:text-[15px]
            "
          >
            {t("home.rooms.description")}
          </p>
        </motion.div>

        {/* ===================================================
            ROOMS
            =================================================== */}

        {rooms.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-3
            "
          >
            {rooms.map(
              (
                room,
                index,
              ) => {
                const favorite =
                  favorites.includes(
                    room.id,
                  );

                const roomImage =
                  getRoomImage(room);

                return (
                  <motion.article
                    key={room.id}
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
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index * 0.06,
                    }}
                    className="
                      group
                      overflow-hidden
                      rounded-[24px]
                      border
                      border-[#B28A47]/14
                      bg-white/85
                      shadow-[0_15px_45px_-38px_rgba(35,20,12,0.30)]
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-[#B28A47]/28
                      hover:shadow-[0_20px_55px_-36px_rgba(35,20,12,0.36)]
                    "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                        relative
                        aspect-[16/11]
                        overflow-hidden
                        bg-[#F3EFE7]
                      "
                    >
                      {roomImage ? (
                        <>
                          <Image
                            src={roomImage}
                            alt={room.name}
                            fill
                            sizes="
                              (max-width: 768px) 100vw,
                              33vw
                            "
                            priority={
                              index === 0
                            }
                            className="
                              object-cover
                              transition-transform
                              duration-700
                              ease-out
                              group-hover:scale-[1.025]
                            "
                          />

                          <div
                            className="
                              pointer-events-none
                              absolute
                              inset-0
                              bg-gradient-to-t
                              from-black/40
                              via-transparent
                              to-black/5
                            "
                          />
                        </>
                      ) : (
                        <div
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-gradient-to-br
                            from-[#F3EFE7]
                            via-[#FFFDF8]
                            to-[#E5D2A7]/35
                          "
                        >
                          <Bed
                            size={38}
                            strokeWidth={1.3}
                            className="text-[#0F5A46]/30"
                          />
                        </div>
                      )}

                      {/* badges */}

                      <div
                        className="
                          absolute
                          left-3
                          top-3
                          z-10
                          flex
                          gap-2
                        "
                      >
                        {room.popular && (
                          <span
                            className="
                              rounded-full
                              border
                              border-white/15
                              bg-[#0F5A46]/90
                              px-2.5
                              py-1
                              text-[8px]
                              font-semibold
                              uppercase
                              tracking-[0.16em]
                              text-[#FFFDF8]
                              backdrop-blur
                            "
                          >
                            Populaire
                          </span>
                        )}

                        {room.luxury && (
                          <span
                            className="
                              rounded-full
                              border
                              border-[#D2AA5A]/30
                              bg-black/30
                              px-2.5
                              py-1
                              text-[8px]
                              font-semibold
                              uppercase
                              tracking-[0.16em]
                              text-[#E8C982]
                              backdrop-blur
                            "
                          >
                            Signature
                          </span>
                        )}
                      </div>

                      {/* favorite */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            room.id,
                          )
                        }
                        aria-pressed={
                          favorite
                        }
                        className="
                          absolute
                          right-3
                          top-3
                          z-10
                          inline-flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/15
                          bg-black/20
                          text-white
                          backdrop-blur-md
                          transition
                          hover:bg-white
                          hover:text-[#0F5A46]
                        "
                      >
                        <Heart
                          size={17}
                          strokeWidth={1.7}
                          className={
                            favorite
                              ? "fill-[#D2AA5A] text-[#D2AA5A]"
                              : ""
                          }
                        />
                      </button>

                      {/* price */}

                      <div
                        className="
                          absolute
                          bottom-3
                          left-3
                          z-10
                          rounded-full
                          border
                          border-white/15
                          bg-black/25
                          px-3.5
                          py-2
                          backdrop-blur-md
                        "
                      >
                        <span
                          className="
                            font-serif
                            text-[18px]
                            font-medium
                            text-white
                          "
                        >
                          {Number(
                            room.base_price,
                          ).toLocaleString(
                            "fr-FR",
                          )}{" "}
                          MAD
                        </span>

                        <span
                          className="
                            ml-1
                            text-[10px]
                            text-white/65
                          "
                        >
                          / nuit
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3
                        className="
                          font-serif
                          text-[23px]
                          font-medium
                          leading-tight
                          tracking-[-0.015em]
                          text-[#201A17]
                        "
                      >
                        {room.name}
                      </h3>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-gray-500
                        "
                      >
                        <Users
                          size={14}
                          strokeWidth={1.6}
                          className="text-[#B28A47]"
                        />

                        Jusqu’à{" "}
                        {room.max_guests}{" "}
                        voyageur
                        {room.max_guests >
                        1
                          ? "s"
                          : ""}
                      </div>

                      <p
                        className="
                          mt-3
                          line-clamp-2
                          text-[13px]
                          font-light
                          leading-[1.65]
                          text-gray-600
                        "
                      >
                        {room.description}
                      </p>

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                          border-t
                          border-[#B28A47]/10
                          pt-4
                        "
                      >
                        <span
                          className="
                            text-[11px]
                            text-gray-400
                          "
                        >
                          Taxes incluses
                        </span>

                        <Link
                          href={`/chambres/${room.id}`}
                          className="
                            group/link
                            inline-flex
                            items-center
                            gap-2
                            text-[13px]
                            font-semibold
                            text-[#0F5A46]
                          "
                        >
                          Découvrir

                          <ArrowRight
                            size={15}
                            strokeWidth={1.7}
                            className="
                              text-[#B28A47]
                              transition-transform
                              group-hover/link:translate-x-1
                            "
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              },
            )}
          </div>
        ) : (
          <div
            className="
              rounded-[24px]
              border
              border-[#B28A47]/15
              bg-white/70
              p-8
              text-center
            "
          >
            <p
              className="
                font-serif
                text-xl
                text-[#201A17]
              "
            >
              Aucune chambre disponible
            </p>
          </div>
        )}

        {/* CTA */}

        {rooms.length > 0 && (
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
            className="
              mt-8
              text-center
            "
          >
            <Link
              href="/chambres"
              className="
                group
                inline-flex
                h-[48px]
                items-center
                justify-center
                gap-3
                rounded-full
                border
                border-[#B28A47]/30
                bg-[#0F5A46]
                px-7
                text-[13px]
                font-semibold
                text-[#FFFDF8]
                shadow-[0_8px_22px_rgba(15,90,70,0.16)]
                transition-all
                hover:-translate-y-px
                hover:bg-[#12604B]
              "
            >
              Voir toutes nos chambres

              <ArrowRight
                size={16}
                strokeWidth={1.7}
                className="
                  text-[#D2AA5A]
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}