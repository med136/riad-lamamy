"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, Check, Images, Users, WalletCards } from "lucide-react";

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

    void fetchRooms();
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
    return <div className="my-12 h-64 animate-pulse rounded-[24px] border border-[#B28A47]/10 bg-[#FFFDF8]" />;
  }

  if (!selectedRoom) return null;

  return (
    <section id="details-chambre" className="scroll-mt-28 py-12 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">En détail</p>
        <h2 className="mt-2 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
          Détails de la chambre
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
          Retrouvez les informations essentielles de chaque chambre sans surcharge visuelle.
        </p>
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {rooms.map((room) => {
          const active = selectedRoom.id === room.id;

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => selectRoom(room.id)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/60 ${
                active
                  ? "border-[#0F5A46] bg-[#0F5A46] text-[#FFFDF8]"
                  : "border-[#B28A47]/20 bg-[#FFFDF8] text-[#5D514C] hover:border-[#B28A47]/45"
              }`}
            >
              {room.name}
            </button>
          );
        })}
      </div>

      <motion.div
        key={selectedRoom.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] p-6 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
              <BedDouble size={17} className="text-[#0F5A46]" strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.20em] text-[#B28A47]">Équipements</p>
              <h3 className="font-serif text-[24px] font-medium text-[#2B1C17]">{selectedRoom.name}</h3>
            </div>
          </div>

          {selectedRoom.amenities.length > 0 ? (
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {selectedRoom.amenities.map((amenity) => (
                <div key={amenity} className="flex items-start gap-2 border-b border-[#B28A47]/10 pb-3 text-[13px] leading-5 text-[#5D514C]">
                  <Check size={15} className="mt-0.5 shrink-0 text-[#0F5A46]" strokeWidth={1.8} />
                  {amenity}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-[14px] border border-[#B28A47]/10 bg-[#F8F5EF]/70 p-4 text-sm text-[#6F625C]">
              Aucun équipement spécifique n’est encore renseigné dans l’administration.
            </p>
          )}
        </div>

        <div className="rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] p-6 sm:p-7">
          <h3 className="font-serif text-[24px] font-medium text-[#2B1C17]">Informations essentielles</h3>

          <div className="mt-5 divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
            <InfoRow icon={Users} label="Capacité" value={`${selectedRoom.max_guests} personne${selectedRoom.max_guests > 1 ? "s" : ""}`} />
            <InfoRow icon={WalletCards} label="Tarif" value={`${selectedRoom.base_price.toLocaleString("fr-FR")} MAD / nuit`} />
            <InfoRow icon={Images} label="Galerie" value={`${selectedRoom.images.length} image${selectedRoom.images.length !== 1 ? "s" : ""}`} />
          </div>

          <p className="mt-5 text-[13px] leading-6 text-[#6F625C]">{selectedRoom.description}</p>
        </div>
      </motion.div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="flex items-center gap-3 text-[13px] text-[#6F625C]">
        <Icon size={16} className="text-[#0F5A46]" strokeWidth={1.6} />
        {label}
      </span>
      <strong className="text-right text-[13px] font-semibold text-[#2B1C17]">{value}</strong>
    </div>
  );
}
