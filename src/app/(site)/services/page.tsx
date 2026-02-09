import type { Metadata } from "next";
import Script from "next/script";
import { ServiceList } from "@/components/ServiceList";
import { SpaSection } from "@/components/SpaSection";
import { RestaurantSection } from "@/components/RestaurantSection";
import { Activities } from "@/components/Activities";

export const metadata: Metadata = {
  title: "Services | Riad Dar Al Andalus",
  description:
    "Services premium, spa, restaurant et experiences sur mesure a Marrakech.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Riad Dar Al Andalus",
    description: "Services premium, spa, restaurant et experiences sur mesure a Marrakech.",
    url: "https://riad-al-andalus.com/services",
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
    title: "Services | Riad Dar Al Andalus",
    description: "Services premium, spa, restaurant et experiences sur mesure a Marrakech.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function ServicesPage() {
  return (
    <div>
      <Script
        id="structured-data-services"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "Services du Riad Dar Al Andalus",
            itemListElement: [
              { "@type": "Offer", name: "Spa et bien-etre" },
              { "@type": "Offer", name: "Restaurant" },
              { "@type": "Offer", name: "Experiences sur mesure" },
            ],
          }),
        }}
      />

      <div className="relative h-[55vh] bg-gradient-to-r from-amber-900/80 to-amber-700/80">
        <div className="absolute inset-0 bg-[url('/images/services/hero-services.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="lux-kicker mb-4 text-amber-100/90">SERVICES</div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Nos services</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Une experience complete et personnalisee
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ServiceList />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            <SpaSection />
            <RestaurantSection />
          </div>
          <Activities />
        </div>
      </div>
    </div>
  );
}
