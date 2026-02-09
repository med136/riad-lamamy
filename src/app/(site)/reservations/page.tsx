import type { Metadata } from "next";
import Script from "next/script";
import BookingForm from "@/components/BookingForm";
import ReservationInfo from "@/components/ReservationInfo";
import PaymentOptions from "@/components/PaymentOptions";
import CancellationPolicy from "@/components/CancellationPolicy";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reservations | Riad Dar Al Andalus",
  description:
    "Reservez votre sejour au Riad Dar Al Andalus. Disponibilites en temps reel, confirmation rapide.",
  alternates: {
    canonical: "/reservations",
  },
  openGraph: {
    title: "Reservations | Riad Dar Al Andalus",
    description: "Reservez votre sejour au Riad Dar Al Andalus. Disponibilites en temps reel, confirmation rapide.",
    url: "https://riad-al-andalus.com/reservations",
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
    title: "Reservations | Riad Dar Al Andalus",
    description: "Reservez votre sejour au Riad Dar Al Andalus. Disponibilites en temps reel, confirmation rapide.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function ReservationsPage() {
  return (
    <div>
      <Script
        id="structured-data-reservations"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ReserveAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://riad-al-andalus.com/reservations",
              actionPlatform: [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform",
              ],
            },
            result: {
              "@type": "LodgingReservation",
              name: "Reservation au Riad Dar Al Andalus",
            },
          }),
        }}
      />

      <div className="relative h-[55vh] bg-gradient-to-r from-emerald-900/80 to-emerald-700/80">
        <div className="absolute inset-0 bg-[url('/images/reservations/hero-reservations.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="lux-kicker mb-4 text-emerald-100/90">RESERVATION</div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Reservez
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Votre sejour inoubliable a Marrakech
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Suspense fallback={<div>Chargement du formulaire...</div>}>
                <BookingForm />
              </Suspense>
              <div className="mt-8">
                <PaymentOptions />
              </div>
            </div>
            <div>
              <ReservationInfo />
              <div className="mt-8">
                <CancellationPolicy />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
