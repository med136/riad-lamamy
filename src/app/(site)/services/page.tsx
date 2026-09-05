import type { Metadata } from "next";
import Script from "next/script";
import { ServiceList } from "@/components/ServiceList";
import { SpaSection } from "@/components/SpaSection";
import { RestaurantSection } from "@/components/RestaurantSection";
import { Activities } from "@/components/Activities";
import { CmsHeroBackground } from "@/components/cms/CmsHeroBackground";
import { CmsEditorialHeroContent } from "@/components/cms/CmsEditorialHeroContent";
import { ContentSection } from "@/components/cms/ContentSection";

export const metadata: Metadata = {
  title: "Services | Dar LaMamy — Riad à Fès",
  description:
    "Découvrez les services et expériences proposés par Dar LaMamy à Fès : table marocaine, bien-être et accompagnement personnalisé.",
  alternates: {
    canonical: "https://darlamamy.com/services",
  },
  openGraph: {
    title: "Services | Dar LaMamy — Riad à Fès",
    description:
      "Découvrez les services et expériences proposés par Dar LaMamy à Fès : table marocaine, bien-être et accompagnement personnalisé.",
    url: "https://darlamamy.com/services",
    siteName: "Dar LaMamy",
    type: "website",
    images: [
      {
        url: "/images/services/hero-darlamamy-services.jpeg",
        width: 1200,
        height: 630,
        alt: "Patio de Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | Dar LaMamy — Riad à Fès",
    description:
      "Services, table marocaine, bien-être et expériences à Dar LaMamy, au cœur de Fès.",
    images: ["/images/services/hero-darlamamy-services.jpeg"],
  },
};

export default function ServicesPage() {
  return (
    <main className="bg-[#F8F5EF] text-[#2B1C17]">
      <Script
        id="structured-data-services"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "Services de Dar LaMamy",
            url: "https://darlamamy.com/services",
            itemListElement: [
              { "@type": "Offer", name: "Table marocaine" },
              { "@type": "Offer", name: "Bien-être" },
              { "@type": "Offer", name: "Expériences et services sur mesure" },
            ],
          }),
        }}
      />

      {/* HERO SERVICES */}
      <ContentSection pageKey="services" sectionKey="hero">
      <section className="relative isolate overflow-hidden border-b border-[#B28A47]/20 bg-[#F8F5EF]">
        <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[350px]">
          <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[47%] xl:w-[44%]">
            <CmsHeroBackground
              pageKey="services"
              fallbackSrc="/images/services/hero-darlamamy-services.jpeg"
              className="absolute inset-0"
              position="center 52%"
            />
            <div className="absolute inset-0 bg-[#B28A47]/[0.02]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.95)_10%,rgba(248,245,239,0.66)_24%,rgba(248,245,239,0.18)_46%,rgba(248,245,239,0)_68%)] sm:bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.94)_12%,rgba(248,245,239,0.52)_31%,rgba(248,245,239,0.08)_58%,rgba(248,245,239,0)_74%)]" />
          </div>

          <div className="pointer-events-none absolute -left-[70px] bottom-[-95px] h-[240px] w-[240px] opacity-[0.08]" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border border-[#B28A47]" />
            <div className="absolute inset-[34px] rotate-45 border border-[#B28A47]" />
            <div className="absolute inset-[68px] rounded-full border border-[#B28A47]" />
          </div>

          <div className="site-container relative z-10 flex min-h-[300px] items-center sm:min-h-[320px] lg:min-h-[350px]">
            <div className="w-full py-7 sm:py-8 lg:w-[64%] lg:py-9 xl:w-[62%]">
              <CmsEditorialHeroContent
                kickerKey="services.hero.kicker"
                titleKey="services.hero.title"
                subtitleKey="services.hero.subtitle"
                tagKeys={["services.hero.tag_1", "services.hero.tag_2", "services.hero.tag_3"]}
              />
            </div>
          </div>
        </div>
      </section>
      </ContentSection>

      <section className="bg-[#FFFDF8] py-12 sm:py-14 lg:py-16">
        <div className="site-container">
          <ServiceList />
          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <SpaSection />
            <RestaurantSection />
          </div>
          <Activities />
        </div>
      </section>
    </main>
  );
}
