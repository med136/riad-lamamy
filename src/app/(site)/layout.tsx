import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import { LanguageProvider } from "@/components/LanguageProvider";
import { cookies } from "next/headers";
import { defaultLanguage, isSupportedLanguage, LANGUAGE_COOKIE } from "@/lib/i18n";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Dar LaMamy | Riad à Fès",
  description:
    "Une maison d’hôtes de caractère au cœur de la médina de Fès, entre hospitalité marocaine et séjour raffiné.",
  metadataBase: new URL("https://darlamamy.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "riad",
    "fès",
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
    url: "https://darlamamy.com",
    title: "Dar LaMamy | Riad à Fès",
    description: "Une maison fassie raffinée au cœur de la médina de Fès.",
    images: [
      {
        url: "/images/hero/riad-exterior.jpg",
        width: 1200,
        height: 630,
        alt: "Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dar LaMamy | Riad à Fès",
    description: "A refined guesthouse in the heart of Fès Medina.",
    images: ["/images/hero/riad-exterior.jpg"],
  },
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const initialLanguage = isSupportedLanguage(langCookie)
    ? langCookie
    : defaultLanguage;

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
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
    </LanguageProvider>
  );
}
