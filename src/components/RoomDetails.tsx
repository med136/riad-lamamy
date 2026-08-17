"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bed, Check, ImageIcon, Users, WalletCards } from "lucide-react";

type Room = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;
  amenities: string[];
  images: string[];
};

type RoomSelectionEvent = CustomEvent<{ roomId: string }>;

export default function RoomDetails() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { rooms?: Room[] };
        const nextRooms = Array.isArray(payload.rooms) ? payload.rooms : [];
        const requestedRoomId = new URLSearchParams(window.location.search).get("room");
        setRooms(nextRooms);
        setSelectedRoomId(
          nextRooms.some((room) => room.id === requestedRoomId)
            ? requestedRoomId
            : nextRooms[0]?.id || null,
        );
      } finally {
        setLoading(false);
      }
    };

    const handleRoomSelection = (event: Event) => {
      setSelectedRoomId((event as RoomSelectionEvent).detail.roomId);
    };

    fetchRooms();
    window.addEventListener("room-selection-change", handleRoomSelection);
    return () => window.removeEventListener("room-selection-change", handleRoomSelection);
  }, []);

  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    window.dispatchEvent(new CustomEvent("room-selection-change", { detail: { roomId } }));
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    url.hash = "details-chambre";
    window.history.replaceState(null, "", url);
  };

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  if (loading) {
    return <div className="my-16 h-80 animate-pulse rounded-3xl bg-amber-50" />;
  }

  if (!selectedRoom) return null;

  return (
    <section id="details-chambre" className="scroll-mt-28 py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Votre séjour</p>
        <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl">Détails des Chambres</h2>
        <p className="mx-auto max-w-3xl text-lg text-gray-600">
          Équipements et informations enregistrés pour chaque chambre.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => selectRoom(room.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              selectedRoom.id === room.id
                ? "bg-amber-700 text-white shadow-lg"
                : "border border-amber-200 bg-white text-gray-700 hover:bg-amber-50"
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      <motion.div
        key={selectedRoom.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 lg:grid-cols-2"
      >
        <div className="rounded-3xl border border-amber-200/50 bg-white p-7 shadow-lg sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700"><Bed size={22} /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Équipements</p>
              <h3 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h3>
            </div>
          </div>

          {selectedRoom.amenities.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedRoom.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 rounded-xl bg-amber-50/60 p-3 text-gray-700">
                  <Check size={18} className="shrink-0 text-emerald-600" />
                  {amenity}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
              Aucun équipement spécifique n’est encore renseigné dans l’administration.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-white to-amber-100 p-7 shadow-lg sm:p-8">
          <h3 className="mb-6 text-2xl font-bold text-gray-900">Informations de la chambre</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/80 p-4">
              <span className="flex items-center gap-3 text-gray-600"><Users size={19} className="text-amber-700" />Capacité</span>
              <strong>{selectedRoom.max_guests} personne{selectedRoom.max_guests > 1 ? "s" : ""}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/80 p-4">
              <span className="flex items-center gap-3 text-gray-600"><WalletCards size={19} className="text-amber-700" />Tarif</span>
              <strong>{selectedRoom.base_price.toLocaleString("fr-FR")} MAD / nuit</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/80 p-4">
              <span className="flex items-center gap-3 text-gray-600"><ImageIcon size={19} className="text-amber-700" />Galerie</span>
              <strong>{selectedRoom.images.length} image{selectedRoom.images.length !== 1 ? "s" : ""}</strong>
            </div>
          </div>
          <p className="mt-6 border-t border-amber-200 pt-5 leading-7 text-gray-600">{selectedRoom.description}</p>
        </div>
      </motion.div>
    </section>
  );
}
