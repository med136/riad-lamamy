import type { Metadata } from "next";
import { RoomList } from "@/components/RoomList";
import { RoomFeatures } from "@/components/RoomFeatures";
import RoomDetails from "@/components/RoomDetails";
import { BookingBanner } from "@/components/BookingBanner";

export const metadata: Metadata = {
  title: "Chambres et suites | Riad Dar Al Andalus",
  description:
    "Decouvrez nos chambres et suites a Marrakech. Elegance marocaine, confort premium et reservation directe.",
  alternates: {
    canonical: "/chambres",
  },
  openGraph: {
    title: "Chambres et suites | Riad Dar Al Andalus",
    description: "Decouvrez nos chambres et suites a Marrakech. Elegance marocaine, confort premium et reservation directe.",
    url: "https://riad-al-andalus.com/chambres",
    type: "website",
    images: [
      {
        url: "/images/hero/riad-exterior.jpg",
        width: 1200,
        height: 630,
        alt: "Riad Dar Al Andalus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chambres et suites | Riad Dar Al Andalus",
    description: "Decouvrez nos chambres et suites a Marrakech. Elegance marocaine, confort premium et reservation directe.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function ChambresPage() {
  return (
    <div>
      <div className="relative h-[65vh] bg-gradient-to-r from-amber-900/80 to-amber-700/80">
        <div className="absolute inset-0 bg-[url('/images/chambres/hero-chambres.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="lux-kicker mb-4 text-amber-100/90">CHAMBRES</div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Nos chambres et suites
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Elegance marocaine et confort contemporain
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <RoomList />
          <RoomDetails />
          <RoomFeatures />
        </div>
      </div>

      <BookingBanner />
    </div>
  );
}
