"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin, Palette, ShoppingBag, Utensils } from "lucide-react";
import GuestPageHeader from "@/components/GuestPageHeader";
import GuestShell from "@/components/GuestShell";
import { useLanguage } from "@/components/LanguageProvider";

const themes = [
  { icon: Compass, title: "Patrimoine", text: "Médina, portes, monuments et lieux emblématiques." },
  { icon: Palette, title: "Artisanat", text: "Zellige, cuir, bois, cuivre et savoir-faire fassi." },
  { icon: Utensils, title: "Saveurs", text: "Adresses et spécialités à découvrir selon vos envies." },
  { icon: ShoppingBag, title: "Souks", text: "Flânez dans les ruelles et découvrez les commerces de la médina." },
];

export default function DiscoverFesPage() {
  const { t } = useLanguage();
  return (
    <GuestShell>
      <GuestPageHeader
        kicker={t("guest.discover_fes")}
        title={t("guest.discover_title")}
        description="Quelques pistes pour explorer Fès selon votre rythme et vos envies."
      />

      <section className="px-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
          <Image
            src="/images/guest/fes-medina.jpg"
            alt="Vue de la médina de Fès"
            fill
            sizes="480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#083D31]/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
            <MapPin size={16} strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">Fès · Maroc</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-4 py-6">
        {themes.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-[18px] border border-[#B28A47]/15 bg-white p-4">
            <Icon size={18} className="text-[#0F5A46]" strokeWidth={1.5} />
            <h2 className="mt-3 font-serif text-[18px] font-medium text-[#2B1C17]">{title}</h2>
            <p className="mt-1.5 text-[11px] leading-5 text-[#6F625C]">{text}</p>
          </article>
        ))}
      </section>

      <section className="px-4 pb-6">
        <div className="rounded-[18px] bg-[#0F5A46] p-5 text-white">
          <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[#D2AA5A]">Conseil Dar LaMamy</p>
          <p className="mt-2 font-serif text-[20px] leading-snug">
            Demandez-nous nos recommandations du moment selon la durée de votre séjour.
          </p>
          <Link href="/guest/contact" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#D2AA5A]/40 px-4 text-[12px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2AA5A]">
            {t("guest.ask_recommendation")}
          </Link>
        </div>
      </section>
    </GuestShell>
  );
}
