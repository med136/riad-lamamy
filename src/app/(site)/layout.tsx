import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Riad Dar Al Andalus - Marrakech",
  description:
    "Un riad d'exception au coeur de la medina de Marrakech. Hebergement luxueux, service personnalise et experience marocaine authentique.",
  metadataBase: new URL("https://riad-al-andalus.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "riad",
    "marrakech",
    "hebergement",
    "luxe",
    "medina",
    "maroc",
    "vacances",
    "hotel",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://riad-al-andalus.com",
    title: "Riad Dar Al Andalus - Marrakech",
    description: "Un havre de paix au coeur de la medina de Marrakech",
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
    title: "Riad Dar Al Andalus - Marrakech",
    description: "Un havre de paix au coeur de la medina de Marrakech",
    images: ["/images/hero/riad-exterior.jpg"],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="site-shell font-sans text-gray-900">
      <Navigation />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
      <CookieBanner />
      <Analytics />
    </div>
  );
}
