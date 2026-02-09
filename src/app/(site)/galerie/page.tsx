import type { Metadata } from "next";
import GaleriePageClient from "@/components/GaleriePageClient";

export const metadata: Metadata = {
  title: "Galerie | Riad Dar Al Andalus",
  description:
    "Galerie photo du Riad Dar Al Andalus a Marrakech. Ambiance, chambres et experiences.",
  alternates: {
    canonical: "/galerie",
  },
  openGraph: {
    title: "Galerie | Riad Dar Al Andalus",
    description: "Galerie photo du Riad Dar Al Andalus a Marrakech. Ambiance, chambres et experiences.",
    url: "https://riad-al-andalus.com/galerie",
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
    title: "Galerie | Riad Dar Al Andalus",
    description: "Galerie photo du Riad Dar Al Andalus a Marrakech. Ambiance, chambres et experiences.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function GaleriePage() {
  return (
    <div>
      <div className="relative h-[55vh] bg-gradient-to-r from-stone-900/80 to-stone-700/80">
        <div className="absolute inset-0 bg-[url('/images/gallery/hero-gallery.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="lux-kicker mb-4 text-amber-100/90">GALERIE</div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Galerie</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Decouvrez l'ambiance unique de notre riad
            </p>
          </div>
        </div>
      </div>

      <div className="py-12 bg-white">
        <GaleriePageClient />
      </div>
    </div>
  );
}
