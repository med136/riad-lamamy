"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Check, ShieldCheck, Users } from "lucide-react";

type Room = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;
  amenities: string[];
  images: string[];
};

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms", { cache: "no-store" });
        const payload = (await response.json()) as { rooms?: Room[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Chargement des chambres impossible.");
        }

        const nextRooms = Array.isArray(payload.rooms) ? payload.rooms : [];
        const requestedRoomId = new URLSearchParams(window.location.search).get("room");
        const initialRoom = nextRooms.some((room) => room.id === requestedRoomId)
          ? requestedRoomId
          : nextRooms[0]?.id || null;

        setRooms(nextRooms);
        setSelectedRoomId(initialRoom);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Chargement des chambres impossible.");
      } finally {
        setLoading(false);
      }
    };

    void fetchRooms();
  }, []);

  useEffect(() => {
    const handleRoomSelection = (event: Event) => {
      const roomId = (event as CustomEvent<{ roomId: string }>).detail.roomId;
      setSelectedRoomId(roomId);
    };

    window.addEventListener("room-selection-change", handleRoomSelection);
    return () => window.removeEventListener("room-selection-change", handleRoomSelection);
  }, []);

  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    window.dispatchEvent(new CustomEvent("room-selection-change", { detail: { roomId } }));

    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    url.hash = "nos-chambres";
    window.history.replaceState(null, "", url);
  };

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  if (loading) {
    return (
      <div id="nos-chambres" className="mb-14 space-y-6 scroll-mt-28">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-[18px] border border-[#B28A47]/10 bg-[#FFFDF8]" />
          ))}
        </div>
        <div className="h-[460px] animate-pulse rounded-[26px] border border-[#B28A47]/10 bg-[#FFFDF8]" />
      </div>
    );
  }

  if (error) {
    return (
      <div id="nos-chambres" className="mb-14 rounded-[18px] border border-red-200 bg-red-50/70 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div id="nos-chambres" className="mb-14 rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8] p-8 text-center text-[#5D514C]">
        Aucune chambre n’est disponible actuellement.
      </div>
    );
  }

  return (
    <section id="nos-chambres" className="mb-14 scroll-mt-28">
      <div className="mb-8 max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Choisir une chambre</p>
        <h2 className="mt-2 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
          Trouvez l’espace qui vous ressemble
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
          Sélectionnez une chambre pour découvrir ses détails, ses équipements et son tarif.
        </p>
      </div>

      <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => {
          const active = selectedRoom.id === room.id;

          return (
            <motion.button
              key={room.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => selectRoom(room.id)}
              className={`rounded-[18px] border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/60 ${
                active
                  ? "border-[#0F5A46]/35 bg-[#0F5A46] text-[#FFFDF8] shadow-[0_14px_34px_-26px_rgba(15,90,70,0.7)]"
                  : "border-[#B28A47]/15 bg-[#FFFDF8] text-[#2B1C17] hover:border-[#B28A47]/35"
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${active ? "text-[#D2AA5A]" : "text-[#B28A47]"}`}>
                Chambre
              </p>
              <h3 className="mt-2 font-serif text-[21px] font-medium leading-tight">{room.name}</h3>
              <p className={`mt-3 text-[13px] ${active ? "text-[#FFFDF8]/80" : "text-[#6F625C]"}`}>
                {room.base_price.toLocaleString("fr-FR")} MAD <span className="opacity-70">/ nuit</span>
              </p>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        key={selectedRoom.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="overflow-hidden rounded-[26px] border border-[#B28A47]/15 bg-[#FFFDF8] shadow-[0_24px_60px_-46px_rgba(43,28,23,0.28)]"
      >
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[320px] bg-[#F8F5EF] lg:min-h-[500px]">
            {selectedRoom.images.length > 0 ? (
              <Image
                src={selectedRoom.images[0]}
                alt={selectedRoom.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#B28A47]/55">
                <BedDouble size={54} strokeWidth={1.2} />
                <span className="mt-3 font-serif text-xl">{selectedRoom.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Dar LaMamy</p>
              <h3 className="mt-2 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[36px]">
                {selectedRoom.name}
              </h3>
              <p className="mt-4 text-[14px] leading-7 text-[#5D514C]">{selectedRoom.description}</p>

              <div className="mt-6 flex items-center gap-3 border-y border-[#B28A47]/15 py-4 text-[13px] text-[#5D514C]">
                <Users size={17} className="text-[#0F5A46]" strokeWidth={1.6} />
                Jusqu’à {selectedRoom.max_guests} personne{selectedRoom.max_guests > 1 ? "s" : ""}
              </div>

              {selectedRoom.amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#2B1C17]">Équipements</h4>
                  <div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2">
                    {selectedRoom.amenities.slice(0, 6).map((amenity) => (
                      <div key={amenity} className="flex items-start gap-2 text-[13px] leading-5 text-[#6F625C]">
                        <Check size={15} className="mt-0.5 shrink-0 text-[#0F5A46]" strokeWidth={1.8} />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-[#B28A47]/15 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B28A47]">À partir de</p>
                  <p className="mt-1 font-serif text-[30px] font-medium text-[#2B1C17]">
                    {selectedRoom.base_price.toLocaleString("fr-FR")} MAD
                    <span className="ml-2 text-[13px] font-normal text-[#6F625C]">/ nuit</span>
                  </p>
                </div>

                <Link
                  href={`/reservations?roomId=${encodeURIComponent(selectedRoom.id)}`}
                  className="inline-flex h-[52px] items-center justify-center rounded-[14px] border border-[#B28A47]/35 bg-[#0F5A46] px-6 text-[14px] font-semibold text-[#FFFDF8] transition hover:-translate-y-px hover:bg-[#063F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47] focus-visible:ring-offset-2"
                >
                  Réserver cette chambre
                </Link>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#6F625C]">
                <ShieldCheck size={14} className="text-[#0F5A46]" strokeWidth={1.6} />
                Réservation directe et sécurisée
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
