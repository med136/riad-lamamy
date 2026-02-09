import type { Metadata } from "next";
import AboutHero from "@/components/AboutHero";
import Values from "@/components/Values";
import Team from "@/components/Team";
import { Experience } from "@/components/Experience";

export const metadata: Metadata = {
  title: "A propos | Riad Dar Al Andalus",
  description:
    "Decouvrez l'histoire du Riad Dar Al Andalus, notre equipe et nos valeurs.",
  alternates: {
    canonical: "/a-propos",
  },
  openGraph: {
    title: "A propos | Riad Dar Al Andalus",
    description: "Decouvrez l'histoire du Riad Dar Al Andalus, notre equipe et nos valeurs.",
    url: "https://riad-al-andalus.com/a-propos",
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
    title: "A propos | Riad Dar Al Andalus",
    description: "Decouvrez l'histoire du Riad Dar Al Andalus, notre equipe et nos valeurs.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <Values />
      <Team />
      <Experience />
    </div>
  );
}
