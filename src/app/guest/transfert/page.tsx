"use client";

import { MapPin, MessageCircle, Plane, Train } from "lucide-react";
import GuestPageHeader from "@/components/GuestPageHeader";
import GuestShell from "@/components/GuestShell";
import { useGuestSettings } from "@/components/guest/GuestProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { whatsappHref } from "@/lib/guest-config";

const options = [
  {
    icon: Plane,
    title: "Aéroport",
    text: "Demandez les possibilités de transfert pour votre arrivée ou votre départ.",
  },
  {
    icon: Train,
    title: "Gare de Fès",
    text: "Nous pouvons vous indiquer les solutions adaptées pour rejoindre Dar LaMamy.",
  },
  {
    icon: MapPin,
    title: "Médina",
    text: "Nous vous communiquerons les indications utiles pour rejoindre la maison dans de bonnes conditions.",
  },
];

export default function TransferPage() {
  const { settings } = useGuestSettings();
  const { t } = useLanguage();
  return (
    <GuestShell>
      <GuestPageHeader
        kicker={t("guest.transfer")}
        title={t("guest.transfer_title")}
        description="Préparez votre arrivée à Fès et contactez-nous pour connaître les solutions disponibles."
      />

      <section className="space-y-3 px-4">
        {options.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="flex gap-4 rounded-[18px] border border-[#B28A47]/15 bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5EF] text-[#0F5A46]">
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-serif text-[19px] font-medium text-[#2B1C17]">{title}</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#6F625C]">{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="px-4 py-6">
        <a
          href={whatsappHref(settings.whatsapp, "Bonjour Dar LaMamy, je souhaite organiser un transfert pour mon séjour.")}
          target={settings.whatsapp ? "_blank" : undefined}
          rel={settings.whatsapp ? "noopener noreferrer" : undefined}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F5A46] px-5 text-[13px] font-semibold text-white"
        >
          <MessageCircle size={17} strokeWidth={1.5} />
          {t("guest.ask_transfer")}
        </a>
      </section>
    </GuestShell>
  );
}
