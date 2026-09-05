import type { Metadata } from "next";
import { RoomList } from "@/components/RoomList";
import { RoomFeatures } from "@/components/RoomFeatures";
import RoomDetails from "@/components/RoomDetails";
import { BookingBanner } from "@/components/BookingBanner";
import { CmsHeroBackground } from "@/components/cms/CmsHeroBackground";
import { CmsEditorialHeroContent } from "@/components/cms/CmsEditorialHeroContent";
import { ContentSection } from "@/components/cms/ContentSection";

export const metadata: Metadata = {
  title: "Chambres & suites | Dar LaMamy — Riad à Fès",
  description:
    "Découvrez les chambres et suites de Dar LaMamy à Fès : charme marocain, confort contemporain et réservation directe.",
  alternates: {
    canonical: "https://darlamamy.com/chambres",
  },
  openGraph: {
    title: "Chambres & suites | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez les chambres et suites de Dar LaMamy à Fès : charme marocain, confort contemporain et réservation directe.",
    url: "https://darlamamy.com/chambres",
    siteName: "Dar LaMamy",
    type: "website",
    images: [
      {
        url: "/images/chambres/hero-darlamamy.jpeg",
        width: 1200,
        height: 630,
        alt: "Patio traditionnel de Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chambres & suites | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez les chambres et suites de Dar LaMamy à Fès : charme marocain, confort contemporain et réservation directe.",
    images: ["/images/chambres/hero-darlamamy.jpeg"],
  },
};

export default function ChambresPage() {
  return (
    <main className="bg-[#F8F5EF] text-[#2B1C17]">
      {/* =========================================================
          HERO CHAMBRES — DAR LAMAMY
          ========================================================= */}
      <ContentSection pageKey="rooms" sectionKey="hero">
      <section className="relative isolate overflow-hidden border-b border-[#B28A47]/20 bg-[#F8F5EF]">
        <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[350px]">
          <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[47%] xl:w-[44%]">
            <CmsHeroBackground
              pageKey="rooms"
              fallbackSrc="/images/chambres/hero-darlamamy.jpeg"
              className="absolute inset-0"
              position="center 46%"
            />
            <div className="absolute inset-0 bg-[#B28A47]/[0.02]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.95)_10%,rgba(248,245,239,0.66)_24%,rgba(248,245,239,0.18)_46%,rgba(248,245,239,0)_68%)] sm:bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.94)_12%,rgba(248,245,239,0.52)_31%,rgba(248,245,239,0.08)_58%,rgba(248,245,239,0)_74%)]" />
          </div>

          <div
            className="pointer-events-none absolute -left-[70px] bottom-[-95px] h-[240px] w-[240px] opacity-[0.08]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full border border-[#B28A47]" />
            <div className="absolute inset-[34px] rotate-45 border border-[#B28A47]" />
            <div className="absolute inset-[68px] rounded-full border border-[#B28A47]" />
          </div>

          <div className="site-container relative z-10 flex min-h-[300px] items-center sm:min-h-[320px] lg:min-h-[350px]">
            <div className="w-full py-7 sm:py-8 lg:w-[64%] lg:py-9 xl:w-[62%]">
              <CmsEditorialHeroContent
                kickerKey="rooms.hero.kicker"
                titleKey="rooms.hero.title"
                subtitleKey="rooms.hero.subtitle"
                tagKeys={["rooms.hero.tag_1", "rooms.hero.tag_2", "rooms.hero.tag_3"]}
              />
            </div>
          </div>
        </div>
      </section>
      </ContentSection>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="site-container">
          <RoomList />
          <RoomDetails />
          <RoomFeatures />
        </div>
      </section>

    </main>
  );
}
