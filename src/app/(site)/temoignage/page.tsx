import type { Metadata } from "next";
import TemoignageForm from "@/components/TemoignageForm";

export const metadata: Metadata = {
  title: "Temoignage | Riad Dar Al Andalus",
  description: "Laissez un avis sur votre sejour au Riad Dar Al Andalus.",
  alternates: {
    canonical: "/temoignage",
  },
  openGraph: {
    title: "Temoignage | Riad Dar Al Andalus",
    description: "Laissez un avis sur votre sejour au Riad Dar Al Andalus.",
    url: "https://riad-al-andalus.com/temoignage",
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
    title: "Temoignage | Riad Dar Al Andalus",
    description: "Laissez un avis sur votre sejour au Riad Dar Al Andalus.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function TemoignagePage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <TemoignageForm />
      </div>
    </div>
  );
}
