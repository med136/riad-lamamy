import type { Metadata } from "next";
import Script from "next/script";
import { ServiceList } from "@/components/ServiceList";
import { SpaSection } from "@/components/SpaSection";
import { RestaurantSection } from "@/components/RestaurantSection";
import { Activities } from "@/components/Activities";

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
      <section className="relative isolate overflow-hidden border-b border-[#B28A47]/20 bg-[#F8F5EF]">
        <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[350px]">
          <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[47%] xl:w-[44%]">
            <div className="absolute inset-0 bg-[url('/images/services/hero-darlamamy-services.jpeg')] bg-cover bg-center lg:bg-[center_52%]" />
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
              <div className="mx-auto max-w-[650px] text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.30em] text-[#0F5A46] sm:text-[10px]">
                  Services
                </p>

                <div className="mx-auto mt-2.5 flex w-[120px] items-center" aria-hidden="true">
                  <span className="h-px flex-1 bg-[#B28A47]/55" />
                  <span className="mx-3 h-[6px] w-[6px] rotate-45 border border-[#B28A47] bg-[#F8F5EF]" />
                  <span className="h-px flex-1 bg-[#B28A47]/55" />
                </div>

                <h1 className="mt-5 font-serif text-[32px] font-medium leading-[1.03] tracking-[-0.012em] text-[#2B1C17] sm:text-[36px] lg:text-[40px] xl:text-[44px]">
                  Des attentions qui prolongent le séjour
                </h1>

                <div className="mx-auto mt-4 flex w-[145px] items-center justify-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-[#B28A47]/40" />
                  <div className="relative h-3.5 w-3.5">
                    <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#B28A47]" />
                    <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#B28A47]" />
                  </div>
                  <span className="h-px flex-1 bg-[#B28A47]/40" />
                </div>

                <p className="mx-auto mt-4 max-w-[510px] text-[13px] leading-6 text-[#5D514C] sm:text-[14px] lg:text-[15px]">
                  Table, bien-être et expériences choisies pour découvrir Fès à votre rythme.
                </p>

                <div className="mt-4 hidden items-center justify-center gap-4 text-[10px] text-[#6F625C] sm:flex">
                  <span className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#B28A47]" />Sur demande</span>
                  <span className="h-3 w-px bg-[#B28A47]/25" />
                  <span className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#B28A47]" />Conseils personnalisés</span>
                  <span className="h-3 w-px bg-[#B28A47]/25" />
                  <span className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#B28A47]" />Fès · Maroc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
