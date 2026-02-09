import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import ContactInfo from "@/components/ContactInfo";
import Map from "@/components/Map";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Contact | Riad Dar Al Andalus",
  description:
    "Contactez le Riad Dar Al Andalus pour votre sejour a Marrakech.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Riad Dar Al Andalus",
    description: "Contactez le Riad Dar Al Andalus pour votre sejour a Marrakech.",
    url: "https://riad-al-andalus.com/contact",
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
    title: "Contact | Riad Dar Al Andalus",
    description: "Contactez le Riad Dar Al Andalus pour votre sejour a Marrakech.",
    images: ["/images/hero/riad-exterior.jpg"],
  },

};

export default function ContactPage() {
  return (
    <div>
      <div className="relative h-[55vh] bg-gradient-to-r from-amber-900/80 to-amber-700/80">
        <div className="absolute inset-0 bg-[url('/images/contact/hero-contact.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="lux-kicker mb-4 text-amber-100/90">CONTACT</div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Contact</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Nous sommes a votre ecoute
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <div>
              <ContactInfo />
              <div className="mt-8">
                <Map />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <FAQ />
          </div>
        </div>
      </div>
    </div>
  );
}
