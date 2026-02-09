import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bed,
  Users,
  Maximize,
  Wifi,
  Coffee,
  Wind,
  Check,
} from "lucide-react";
import { BookingBanner } from "@/components/BookingBanner";
import RoomGallery from "@/components/RoomGallery";
import { createClient } from "@/lib/supabase/server";

type Room = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;
  amenities: string | string[] | null;
  images: string | string[] | null;
};

const parseJsonList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      if (typeof parsed === "string" && parsed.trim()) return [parsed.trim()];
    } catch {
      if (value.trim()) return [value.trim()];
    }
  }
  return [];
};

const getRoom = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, description, base_price, max_guests, amenities, images")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Room;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const room = await getRoom(params.id);
  if (!room) {
    return {
      title: "Chambre | Riad Dar Al Andalus",
    };
  }

  const images = parseJsonList(room.images);
  const fallbackImage = `/images/chambres/${room.id}/default.jpg`;
  const ogImage = images[0] || fallbackImage;

  return {
    title: `${room.name} | Riad Dar Al Andalus`,
    description:
      room.description ||
      "Chambre elegante au Riad Dar Al Andalus, Marrakech.",
    alternates: {
      canonical: `/chambres/${room.id}`,
    },
    openGraph: {
      title: `${room.name} | Riad Dar Al Andalus`,
      description:
        room.description ||
        "Chambre elegante au Riad Dar Al Andalus, Marrakech.",
      url: `https://riad-al-andalus.com/chambres/${room.id}`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: room.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${room.name} | Riad Dar Al Andalus`,
      description:
        room.description ||
        "Chambre elegante au Riad Dar Al Andalus, Marrakech.",
      images: [ogImage],
    },
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const room = await getRoom(params.id);
  if (!room) {
    notFound();
  }

  const images = parseJsonList(room.images);
  const amenitiesList = parseJsonList(room.amenities);
  const fallbackImage = `/images/chambres/${room.id}/default.jpg`;


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: room.max_guests,
    },
    priceSpecification: {
      "@type": "PriceSpecification",
      price: room.base_price,
      priceCurrency: "MAD",
    },
    bed: "Bed",
    image: images.length ? images : [fallbackImage],
    containedInPlace: {
      "@type": "Hotel",
      name: "Riad Dar Al Andalus",
      address: {
        "@type": "PostalAddress",
        streetAddress: "123 Derb Sidi Bouloukat",
        addressLocality: "Marrakech",
        postalCode: "40000",
        addressCountry: "MA",
      },
      url: "https://riad-al-andalus.com",
    },
  };

  const features = [
    { icon: Bed, text: "Lit(s) confortable(s)" },
    { icon: Users, text: `Jusqu'a ${room.max_guests} personnes` },
    { icon: Maximize, text: "Chambre spacieuse" },
    { icon: Wifi, text: "Wi-Fi gratuit" },
    { icon: Coffee, text: "Petit-dejeuner inclus" },
    { icon: Wind, text: "Climatisation" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        id="structured-data-room"
      />
      <div className="bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/chambres"
            className="inline-flex items-center text-amber-700 hover:text-amber-800 font-semibold"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux chambres
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <RoomGallery
            images={images}
            roomName={room.name}
            fallbackSrc={fallbackImage}
          />

          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {room.name}
            </h1>

            <div className="mb-6">
              <p className="text-sm text-gray-500 uppercase tracking-wider">A partir de</p>
              <p className="text-3xl font-bold text-amber-700">
                {room.base_price} MAD
              </p>
              <p className="text-sm text-gray-600">par nuit</p>
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {room.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-3 lux-panel rounded-lg border border-amber-200/40"
                >
                  <feature.icon className="text-amber-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/reservations?room_id=${room.id}`}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-4 px-6 rounded-full transition-all shadow-2xl text-center"
            >
              Reserver cette chambre
            </Link>
          </div>
        </div>

        {amenitiesList.length > 0 && (
          <div className="mt-16 pt-12 border-t border-amber-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Equipements et services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {amenitiesList.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-4 lux-panel rounded-lg border border-amber-200/40"
                >
                  <Check className="text-green-600 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BookingBanner />
    </div>
  );
}
