import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import ContactInfo from "@/components/ContactInfo";
import Map from "@/components/Map";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Contact | Dar LaMamy — Riad à Fès",
  description:
    "Contactez Dar LaMamy à Fès pour préparer votre séjour, poser une question ou organiser une demande particulière.",
  alternates: {
    canonical: "https://darlamamy.com/contact",
  },
  openGraph: {
    title: "Contact | Dar LaMamy — Fès",
    description:
      "Contactez Dar LaMamy à Fès pour préparer votre séjour ou nous adresser une demande.",
    url: "https://darlamamy.com/contact",
    type: "website",
    images: [
      {
        url: "/images/contact/hero-darlamamy-contact.jpeg",
        width: 1200,
        height: 630,
        alt: "Dar LaMamy à Fès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Dar LaMamy — Fès",
    description:
      "Contactez Dar LaMamy à Fès pour préparer votre séjour ou nous adresser une demande.",
    images: ["/images/contact/hero-darlamamy-contact.jpeg"],
  },
};

export default function ContactPage() {
  return (
    <main className="bg-[#F8F5EF]">
      {/* HERO */}
      <section className="relative min-h-[300px] overflow-hidden border-b border-[#B28A47]/15 bg-[#F8F5EF] sm:min-h-[320px] lg:min-h-[350px]">
        <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[47%] xl:w-[44%]">
          <div
            className="absolute inset-0 bg-[url('/images/contact/hero-darlamamy-contact.jpeg')] bg-cover bg-center"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.95)_10%,rgba(248,245,239,0.66)_24%,rgba(248,245,239,0.18)_46%,rgba(248,245,239,0)_68%)] sm:bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.94)_12%,rgba(248,245,239,0.52)_31%,rgba(248,245,239,0.08)_58%,rgba(248,245,239,0)_74%)]"
            aria-hidden="true"
          />
        </div>

        <div className="site-container relative flex min-h-[300px] items-center py-7 sm:min-h-[320px] sm:py-8 lg:min-h-[350px] lg:py-9">
          <div className="w-full text-center sm:w-[58%] lg:w-[54%]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0F5A46]">
              Contact
            </p>

            <div className="mx-auto mt-3 flex w-[118px] items-center" aria-hidden="true">
              <span className="h-px flex-1 bg-[#B28A47]/45" />
              <span className="mx-3 h-[6px] w-[6px] rotate-45 border border-[#B28A47]/65" />
              <span className="h-px flex-1 bg-[#B28A47]/45" />
            </div>

            <h1 className="mt-4 font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.025em] text-[#2B1C17] sm:text-[36px] lg:text-[40px] xl:text-[44px]">
              Parlons de votre séjour
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
              Une question, une réservation ou une demande particulière ?
              Notre équipe est à votre écoute pour préparer votre venue à Fès.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-[#6F625C]">
              <span>Réservation directe</span>
              <span className="text-[#B28A47]" aria-hidden="true">◆</span>
              <span>Assistance personnalisée</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="site-container py-10 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <ContactForm />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <ContactInfo />
            <div className="overflow-hidden rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8]">
              <Map />
            </div>
          </aside>
        </div>

        <div className="mt-12 lg:mt-14">
          <FAQ />
        </div>
      </section>
    </main>
  );
}
