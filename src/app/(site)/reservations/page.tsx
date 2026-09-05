import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";

import BookingForm from "@/components/BookingForm";
import ReservationInfo from "@/components/ReservationInfo";
import PaymentOptions from "@/components/PaymentOptions";
import CancellationPolicy from "@/components/CancellationPolicy";
import { CmsHeroBackground } from "@/components/cms/CmsHeroBackground";
import { CmsEditorialHeroContent } from "@/components/cms/CmsEditorialHeroContent";
import { ContentSection } from "@/components/cms/ContentSection";

export const metadata: Metadata = {
  title: "Réservations | Dar LaMamy",
  description:
    "Réservez votre séjour à Dar LaMamy, au cœur de Fès. Consultez les disponibilités et préparez votre séjour en toute sérénité.",
  alternates: {
    canonical: "/reservations",
  },
  openGraph: {
    title: "Réservations | Dar LaMamy",
    description:
      "Réservez votre séjour à Dar LaMamy, au cœur de Fès. Consultez les disponibilités et préparez votre séjour en toute sérénité.",
    url: "https://darlamamy.com/reservations",
    type: "website",
    images: [
      {
        url: "/images/reservations/hero-reservations.jpg",
        width: 1200,
        height: 630,
        alt: "Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Réservations | Dar LaMamy",
    description:
      "Réservez votre séjour à Dar LaMamy, au cœur de Fès. Consultez les disponibilités et préparez votre séjour en toute sérénité.",
    images: ["/images/reservations/hero-reservations.jpg"],
  },
};

export default function ReservationsPage() {
  return (
    <main className="bg-[#F8F5EF]">
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
              urlTemplate: "https://darlamamy.com/reservations",
              actionPlatform: [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform",
              ],
            },
            result: {
              "@type": "LodgingReservation",
              name: "Réservation à Dar LaMamy",
            },
          }),
        }}
      />

      {/* ======================================================
          HERO
          ====================================================== */}
{/* =========================================================
    HERO RESERVATIONS — DAR LAMAMY
    ========================================================= */}
<ContentSection pageKey="reservations" sectionKey="hero">
<section
  className="
    relative
    isolate
    overflow-hidden
    border-b
    border-[#B28A47]/20
    bg-[#F8F5EF]
  "
>
  <div
    className="
      relative
      min-h-[300px]
      sm:min-h-[320px]
      lg:min-h-[350px]
    "
  >
    {/* PHOTO DAR LAMAMY */}
    <div
      className="
        absolute
        inset-y-0
        right-0
        w-full
        sm:w-[58%]
        lg:w-[47%]
        xl:w-[44%]
      "
    >
      <CmsHeroBackground
        pageKey="reservations"
        fallbackSrc="/images/reservations/hero-darlamamy.jpeg"
        className="absolute inset-0"
        position="center 48%"
      />

      <div className="absolute inset-0 bg-[#B28A47]/[0.025]" />

      <div
        className="
          absolute
          inset-0
          bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.95)_10%,rgba(248,245,239,0.66)_24%,rgba(248,245,239,0.18)_46%,rgba(248,245,239,0)_68%)]
          sm:bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.94)_12%,rgba(248,245,239,0.52)_31%,rgba(248,245,239,0.08)_58%,rgba(248,245,239,0)_74%)]
        "
      />
    </div>

    {/* CONTENU */}
    <div
      className="
        site-container
        relative
        z-10
        flex
        min-h-[300px]
        items-center
        sm:min-h-[320px]
        lg:min-h-[350px]
      "
    >
      <div
        className="
          w-full
          py-7
          sm:py-8
          lg:w-[64%]
          lg:py-9
          xl:w-[62%]
        "
      >
        <CmsEditorialHeroContent
                kickerKey="reservations.hero.kicker"
                titleKey="reservations.hero.title"
                subtitleKey="reservations.hero.subtitle"
                tagKeys={["reservations.hero.tag_1", "reservations.hero.tag_2", "reservations.hero.tag_3"]}
              />
      </div>
    </div>
  </div>
</section>
</ContentSection>

      {/* ======================================================
          BOOKING SECTION
          ====================================================== */}
      <section className="relative py-12 sm:py-14 lg:py-16">
        <div className="site-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.75fr)] lg:gap-10">
            {/* Main column */}
            <div className="min-w-0">
              <div
                className="
                  rounded-[28px]
                  border
                  border-[#B28A47]/15
                  bg-[#FFFDF8]
                  p-5
                  shadow-[0_18px_55px_-34px_rgba(43,28,23,0.25)]
                  sm:p-7
                  lg:p-8
                "
              >
                <div className="mb-7">
                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.30em]
                      text-[#B28A47]
                    "
                  >
                    Votre séjour
                  </div>

                  <h2
                    className="
                      mt-2
                      font-serif
                      text-[32px]
                      font-medium
                      leading-tight
                      text-[#2B1C17]
                      sm:text-[38px]
                    "
                  >
                    Vérifier les disponibilités
                  </h2>

                  <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#6B5E57]">
                    Sélectionnez vos dates et les détails de votre séjour
                    pour découvrir les chambres disponibles.
                  </p>
                </div>

                <Suspense
                  fallback={
                    <div
                      className="
                        flex
                        min-h-[260px]
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-[#B28A47]/10
                        bg-[#F8F5EF]
                        text-sm
                        text-[#6B5E57]
                      "
                    >
                      Chargement du formulaire...
                    </div>
                  }
                >
                  <BookingForm />
                </Suspense>
              </div>

              <div className="mt-6">
                <div
                  className="
                    rounded-[24px]
                    border
                    border-[#B28A47]/15
                    bg-[#FFFDF8]
                    p-5
                    shadow-[0_14px_40px_-30px_rgba(43,28,23,0.18)]
                    sm:p-6
                  "
                >
                  <PaymentOptions />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div
                className="
                  rounded-[24px]
                  border
                  border-[#B28A47]/15
                  bg-[#FFFDF8]
                  p-5
                  shadow-[0_14px_40px_-30px_rgba(43,28,23,0.18)]
                  sm:p-6
                "
              >
                <ReservationInfo />
              </div>

              <div
                className="
                  rounded-[24px]
                  border
                  border-[#B28A47]/15
                  bg-[#FFFDF8]
                  p-5
                  shadow-[0_14px_40px_-30px_rgba(43,28,23,0.18)]
                  sm:p-6
                "
              >
                <CancellationPolicy />
              </div>

              {/* Confidence block */}
              <div
                className="
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-[#0F5A46]/15
                  bg-[#0F5A46]
                  p-6
                  text-[#FFFDF8]
                  shadow-[0_20px_45px_-30px_rgba(15,90,70,0.42)]
                "
              >
                <div
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-[#D2AA5A]
                  "
                >
                  Dar LaMamy
                </div>

                <h3
                  className="
                    mt-3
                    font-serif
                    text-[26px]
                    font-medium
                    leading-tight
                  "
                >
                  Une réservation simple et sereine
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-[#FFFDF8]/75
                  "
                >
                  Notre équipe reste disponible pour vous accompagner
                  avant votre arrivée et pendant votre séjour à Fès.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}