"use client";

import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Info,
  KeyRound,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import GuestPageHeader from "@/components/GuestPageHeader";
import GuestShell from "@/components/GuestShell";
import { useGuestSettings } from "@/components/guest/GuestProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { whatsappHref } from "@/lib/guest-config";

export default function GuidePage() {
  const { settings } = useGuestSettings();
  const { t } = useLanguage();
  const info = [
    settings.checkIn ? { icon: Clock3, title: "Check-in", value: settings.checkIn } : null,
    settings.checkOut ? { icon: Clock3, title: "Check-out", value: settings.checkOut } : null,
    settings.wifiName ? { icon: Wifi, title: "Wi-Fi", value: settings.wifiName } : null,
    settings.address.length ? { icon: MapPin, title: "Localisation", value: settings.address.join(" · ") } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
  return (
    <GuestShell>
      <GuestPageHeader
        kicker={t("guest.riad_guide")}
        title={t("guest.guide_title")}
        description="Un résumé pratique pour profiter sereinement de votre séjour."
      />

      <section className="grid grid-cols-2 gap-3 px-4">
        {info.map(({ icon: Icon, title, value }) => (
          <article key={title} className="rounded-[18px] border border-[#B28A47]/15 bg-white p-4">
            <Icon size={17} className="text-[#0F5A46]" strokeWidth={1.5} />
            <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#B28A47]">{title}</p>
            <p className="mt-1 font-serif text-[17px] font-medium text-[#2B1C17]">{value}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3 px-4 py-6">
        <GuideRow icon={KeyRound} title="Accès" text="Les instructions détaillées peuvent vous être communiquées avant votre arrivée." />
        <GuideRow icon={ShieldCheck} title="Sécurité" text="Conservez les informations importantes de votre séjour et contactez l’équipe en cas de besoin." />
        <GuideRow icon={Info} title="Règles de la maison" text={settings.houseRules || "Les informations spécifiques vous seront présentées au moment de votre accueil."} />
        <GuideRow icon={CheckCircle2} title="Départ" text="Prévenez-nous si vous avez besoin d’aide pour organiser votre départ." />
      </section>

      <section className="px-4 pb-6">
        <a
          href={whatsappHref(settings.whatsapp, "Bonjour Dar LaMamy, j’ai une question concernant le guide du riad.")}
          target={settings.whatsapp ? "_blank" : undefined}
          rel={settings.whatsapp ? "noopener noreferrer" : undefined}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F5A46] px-5 text-[13px] font-semibold text-white"
        >
          <MessageCircle size={17} strokeWidth={1.5} />
          {t("guest.ask_question")}
        </a>
      </section>
    </GuestShell>
  );
}

function GuideRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpen;
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
