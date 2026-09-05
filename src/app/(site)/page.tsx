import { Hero } from "@/components/Hero";
import { BookingWidget } from "@/components/BookingWidget";
import { RoomPreview } from "@/components/RoomPreview";
import { Services } from "@/components/Services";
import { AboutPreview } from "@/components/AboutPreview";
import { Testimonials, type TestimonialItem } from "@/components/Testimonials";
import { GalleryPreview } from "@/components/GalleryPreview";
import { Experience } from "@/components/Experience";
import Script from "next/script";
import { cookies } from "next/headers";
import {
  defaultLanguage,
  getLocaleForLanguage,
  isSupportedLanguage,
  LANGUAGE_COOKIE,
} from "@/lib/i18n";

export default async function HomePage() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const language = isSupportedLanguage(langCookie) ? langCookie : defaultLanguage;
  const locale = getLocaleForLanguage(language);
  const fallbackName = language === "en" ? "Guest" : "Client";

  let items: TestimonialItem[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/testimonials`, { cache: 'no-store' })
    if (res.ok) {
      const { data } = await res.json()
      if (Array.isArray(data)) {
        items = data.map((t: any, idx: number) => {
          const name: string = t.guest_name || fallbackName
          const country: string = t.guest_country || ''
          const created: string = t.created_at || new Date().toISOString()
          const date = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(created))
          const initials = name
            .split(' ')
            .filter(Boolean)
            .map(part => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
          return {
            id: t.id ?? idx,
            name,
            location: country,
            date,
            rating: t.rating ?? 5,
            text: t.content ?? '',
            avatar: initials,
            stay: '',
            featured: !!t.featured,
          } as TestimonialItem
        })
      }
    }
  } catch {}

  return (
    <div className="overflow-hidden">
      <Script
        id="structured-data-hotel"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: "Dar LaMamy",
            description:
              "Maison d’hôtes de caractère au cœur de la médina de Fès.",
            url: "https://darlamamy.com",
            priceRange: "$$",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Fès",
              addressCountry: "MA",
            },
            image: ["https://darlamamy.com/riad-login-courtyard.png"],
          }),
        }}
      />
            <Script
        id="structured-data-local-business"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: "Dar LaMamy",
            url: "https://darlamamy.com",
            image: "https://darlamamy.com/riad-login-courtyard.png",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Fès",
              addressCountry: "MA",
            },
            priceRange: "$$",
          }),
        }}
      />
      <Hero />
      <BookingWidget />
      <AboutPreview />
      <RoomPreview />
      <Services />
      <Experience />
      <GalleryPreview />
      <Testimonials items={items} />
    </div>
  );
}
