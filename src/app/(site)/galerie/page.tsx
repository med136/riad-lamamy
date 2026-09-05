import type { Metadata } from "next";
import GaleriePageClient from "@/components/GaleriePageClient";
import { CmsHeroBackground } from "@/components/cms/CmsHeroBackground";
import { CmsEditorialHeroContent } from "@/components/cms/CmsEditorialHeroContent";
import { ContentSection } from "@/components/cms/ContentSection";

export const metadata: Metadata = {
  title: "Galerie | Dar LaMamy — Riad à Fès",
  description:
    "Découvrez Dar LaMamy en images : architecture, chambres, détails artisanaux et atmosphère au cœur de Fès.",
  alternates: {
    canonical: "https://darlamamy.com/galerie",
  },
  openGraph: {
    title: "Galerie | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez Dar LaMamy en images : architecture, chambres, détails artisanaux et atmosphère au cœur de Fès.",
    url: "https://darlamamy.com/galerie",
    siteName: "Dar LaMamy",
    type: "website",
    images: [
      {
        url: "/images/gallery/hero-darlamamy-galerie.jpeg",
        width: 1200,
        height: 630,
        alt: "Galerie Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galerie | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez Dar LaMamy en images : architecture, chambres, détails artisanaux et atmosphère au cœur de Fès.",
    images: ["/images/gallery/hero-darlamamy-galerie.jpeg"],
  },
};

export default function GaleriePage() {
  return (
    <main className="bg-[#F8F5EF] text-[#2B1C17]">
      {/* =====================================================
          HERO GALERIE — DAR LAMAMY
          ===================================================== */}
      <ContentSection pageKey="gallery" sectionKey="hero">
      <section
        className="relative isolate overflow-hidden border-b border-[#B28A47]/20 bg-[#F8F5EF]"
      >
        <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[350px]">
          {/* Photo Dar LaMamy */}
          <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[47%] xl:w-[44%]">
            <CmsHeroBackground
              pageKey="gallery"
              fallbackSrc="/images/gallery/hero-darlamamy-galerie.jpeg"
              className="absolute inset-0"
              position="center 50%"
            />

            <div className="absolute inset-0 bg-[#B28A47]/[0.02]" />

            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.95)_10%,rgba(248,245,239,0.66)_24%,rgba(248,245,239,0.18)_46%,rgba(248,245,239,0)_68%)] sm:bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.94)_12%,rgba(248,245,239,0.52)_31%,rgba(248,245,239,0.08)_58%,rgba(248,245,239,0)_74%)]"
            />
          </div>

          {/* Décor discret */}
          <div
            className="pointer-events-none absolute -left-[70px] bottom-[-95px] h-[240px] w-[240px] opacity-[0.08]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full border border-[#B28A47]" />
            <div className="absolute inset-[34px] rotate-45 border border-[#B28A47]" />
            <div className="absolute inset-[68px] rounded-full border border-[#B28A47]" />
          </div>

          {/* Contenu */}
          <div className="site-container relative z-10 flex min-h-[300px] items-center sm:min-h-[320px] lg:min-h-[350px]">
            <div className="w-full py-7 sm:py-8 lg:w-[64%] lg:py-9 xl:w-[62%]">
              <CmsEditorialHeroContent
                kickerKey="gallery.hero.kicker"
                titleKey="gallery.hero.title"
                subtitleKey="gallery.hero.subtitle"
                tagKeys={["gallery.hero.tag_1", "gallery.hero.tag_2", "gallery.hero.tag_3"]}
              />
            </div>
          </div>
        </div>
      </section>
      </ContentSection>

      {/* =====================================================
          GALERIE
          ===================================================== */}
      <section className="bg-[#FFFDF8] py-10 sm:py-12 lg:py-14">
        <GaleriePageClient />
      </section>
    </main>
  );
}
