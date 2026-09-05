"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, Coffee, MessageCircle, Utensils } from "lucide-react";
import GuestPageHeader from "@/components/GuestPageHeader";
import GuestShell from "@/components/GuestShell";
import { useLanguage } from "@/components/LanguageProvider";

export default function BreakfastPage() {
  const { t } = useLanguage();
  return (
    <GuestShell>
      <GuestPageHeader
        kicker={t("guest.breakfast")}
        title={t("guest.breakfast_title")}
        description="Retrouvez ici les informations utiles pour votre petit-déjeuner à Dar LaMamy."
      />

      <section className="px-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
          <Image
            src="/images/guest/breakfast.jpg"
            alt="Petit-déjeuner marocain"
            fill
            sizes="480px"
            className="object-cover"
          />
        </div>
      </section>

      <section className="space-y-3 px-4 py-6">
        <InfoRow icon={Clock3} title="Horaires" text="Les horaires vous seront confirmés sur place ou avant votre arrivée." />
        <InfoRow icon={Coffee} title="Esprit de la maison" text="Une sélection inspirée des saveurs marocaines et des habitudes de la maison." />
        <InfoRow icon={Utensils} title="Demande particulière" text="Signalez-nous toute allergie, préférence ou contrainte alimentaire à l’avance." />
      </section>
      <section className="px-4 pb-6">
        <Link href="/guest/contact" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F5A46] px-5 text-[13px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]">
          <MessageCircle size={17} strokeWidth={1.5} />
          {t("guest.ask_information")}
        </Link>
      </section>
    </GuestShell>
  );
}

function InfoRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Clock3;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-[18px] border border-[#B28A47]/15 bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8F5EF] text-[#0F5A46]">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="font-serif text-[18px] font-medium text-[#2B1C17]">{title}</h2>
        <p className="mt-1 text-[12px] leading-5 text-[#6F625C]">{text}</p>
      </div>
    </div>
  );
}
