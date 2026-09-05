import type { Metadata } from "next";
import AboutHero from "@/components/AboutHero";
import Values from "@/components/Values";
import Team from "@/components/Team";
import { Experience } from "@/components/Experience";

export const metadata: Metadata = {
  title: "À propos | Dar LaMamy — Riad à Fès",
  description:
    "Découvrez l'esprit de Dar LaMamy, une maison d'hôtes au cœur de Fès où l'architecture, l'accueil et l'art de vivre marocain se rencontrent.",
  alternates: {
    canonical: "https://darlamamy.com/a-propos",
  },
  openGraph: {
    title: "À propos | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez l'esprit de Dar LaMamy, une maison d'hôtes au cœur de Fès.",
    url: "https://darlamamy.com/a-propos",
    type: "website",
    images: [
      {
        url: "/images/about/hero-darlamamy-about.jpeg",
        width: 1200,
        height: 630,
        alt: "Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez l'esprit de Dar LaMamy, une maison d'hôtes au cœur de Fès.",
    images: ["/images/about/hero-darlamamy-about.jpeg"],
  },
};

export default function AboutPage() {
  return (
    <main className="bg-[#FFFDF8]">
      <AboutHero />
      <Values />
      <Team />
      <Experience />
    </main>
  );
}
