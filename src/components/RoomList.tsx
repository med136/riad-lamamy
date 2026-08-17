"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bed, Check, Shield, Users } from "lucide-react";

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
        if (!response.ok) throw new Error(payload.error || "Chargement des chambres impossible.");

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

    fetchRooms();
  }, []);

  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    url.hash = "nos-chambres";
    window.history.replaceState(null, "", url);
  };

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  if (loading) {
    return (
      <div id="nos-chambres" className="mb-16 space-y-6 scroll-mt-28">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl bg-amber-50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div id="nos-chambres" className="mb-16 rounded-2xl bg-red-50 p-6 text-red-700">{error}</div>;
  }

  if (!selectedRoom) {
    return (
      <div id="nos-chambres" className="mb-16 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-gray-700">
        Aucune chambre n’est disponible actuellement.
      </div>
    );
  }

  return (
    <section id="nos-chambres" className="mb-16 scroll-mt-28">
      <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => (
          <motion.button
            key={room.id}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRoom(room.id)}
            className={`rounded-2xl border p-5 text-left transition-all ${
              selectedRoom.id === room.id
                ? "border-amber-600 bg-gradient-to-br from-amber-700 to-amber-600 text-white shadow-xl"
                : "border-amber-200/60 bg-white text-gray-800 shadow-sm hover:border-amber-300 hover:bg-amber-50"
            }`}
          >
            <h2 className="mb-2 text-xl font-bold">{room.name}</h2>
            <p className="text-2xl font-bold">
              {room.base_price.toLocaleString("fr-FR")} MAD
              <span className="text-xs font-normal opacity-75"> / nuit</span>
            </p>
            <p className={`mt-3 line-clamp-2 text-sm ${selectedRoom.id === room.id ? "text-amber-50" : "text-gray-600"}`}>
              {room.description}
            </p>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={selectedRoom.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-amber-200/50 bg-white shadow-xl"
      >
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-72 bg-gradient-to-br from-amber-100 to-stone-100 lg:min-h-[520px]">
            {selectedRoom.images.length > 0 ? (
              <Image src={selectedRoom.images[0]} alt={selectedRoom.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-800/50">
                <Bed size={58} />
                <span className="mt-3 font-semibold">{selectedRoom.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col p-7 sm:p-9 lg:p-12">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Chambre</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-gray-900">{selectedRoom.name}</h2>
              <p className="mt-5 leading-7 text-gray-600">{selectedRoom.description}</p>
              <div className="mt-7 flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-gray-700">
                <Users size={20} className="text-amber-700" />
                Jusqu’à {selectedRoom.max_guests} personne{selectedRoom.max_guests > 1 ? "s" : ""}
              </div>

              {selectedRoom.amenities.length > 0 && (
                <div className="mt-7">
                  <h3 className="mb-4 font-semibold text-gray-900">Équipements et services</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedRoom.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={17} className="shrink-0 text-emerald-600" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-9 border-t border-amber-100 pt-7">
              <p className="mb-5 text-center text-3xl font-bold text-amber-700">
                {selectedRoom.base_price.toLocaleString("fr-FR")} MAD
                <span className="text-sm font-normal text-gray-500"> / nuit</span>
              </p>
              <Link href={`/reservations?room_id=${encodeURIComponent(selectedRoom.id)}`} className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 font-bold text-white shadow-lg transition hover:from-amber-700 hover:to-amber-800">
                Réserver cette chambre
              </Link>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={15} />
                Réservation sécurisée
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
