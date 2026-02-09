import { Hero } from "@/components/Hero";
import { BookingWidget } from "@/components/BookingWidget";
import { RoomPreview } from "@/components/RoomPreview";
import { Services } from "@/components/Services";
import { AboutPreview } from "@/components/AboutPreview";
import { Testimonials, type TestimonialItem } from "@/components/Testimonials";
import { GalleryPreview } from "@/components/GalleryPreview";
import { Experience } from "@/components/Experience";
import Script from "next/script";

export default async function HomePage() {
  let items: TestimonialItem[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/testimonials`, { cache: 'no-store' })
    if (res.ok) {
      const { data } = await res.json()
      if (Array.isArray(data)) {
        items = data.map((t: any, idx: number) => {
          const name: string = t.guest_name || 'Client'
          const country: string = t.guest_country || ''
          const created: string = t.created_at || new Date().toISOString()
          const date = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(created))
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
            name: "Riad Dar Al Andalus",
            description:
              "Maison d'hotes a Marrakech, experience premium et reservations directes.",
            url: "https://riad-al-andalus.com",
            telephone: "+212524389412",
            priceRange: "$$",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Derb Sidi Bouloukat",
              addressLocality: "Marrakech",
              postalCode: "40000",
              addressCountry: "MA",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 31.6315,
              longitude: -7.9893,
            },
            image: ["https://riad-al-andalus.com/images/hero/riad-exterior.jpg"],
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
            name: "Riad Dar Al Andalus",
            url: "https://riad-al-andalus.com",
            image: "https://riad-al-andalus.com/images/hero/riad-exterior.jpg",
            telephone: "+212524389412",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Derb Sidi Bouloukat",
              addressLocality: "Marrakech",
              postalCode: "40000",
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
