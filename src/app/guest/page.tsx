"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Car,
  ChevronRight,
  Clock3,
  Coffee,
  Compass,
  MapPin,
  MessageCircle,
  Phone,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

import GuestShell from "@/components/GuestShell";
import GuestCard from "@/components/GuestCard";
import { useGuestSettings } from "@/components/guest/GuestProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { phoneHref, whatsappHref } from "@/lib/guest-config";

const services = [
  {
    title: "Petit-déjeuner",
    subtitle: "Horaires & informations",
    icon: Coffee,
    href: "/guest/petit-dejeuner",
  },
  {
    title: "Transfert",
    subtitle: "Aéroport & déplacements",
    icon: Car,
    href: "/guest/transfert",
  },
  {
    title: "Découvrir Fès",
    subtitle: "Lieux & expériences",
    icon: MapPin,
    href: "/guest/decouvrir-fes",
  },
  {
    title: "WhatsApp",
    subtitle: "Discussion directe",
    icon: MessageCircle,
    href: "/guest/contact",
  },
  {
    title: "Demander un service",
    subtitle: "Pendant votre séjour",
    icon: UtensilsCrossed,
    href: "/guest/services",
  },
  {
    title: "Guide du riad",
    subtitle: "Informations utiles",
    icon: BookOpen,
    href: "/guest/guide",
  },
];

export default function GuestPage() {
  const { settings } = useGuestSettings();
  const { t } = useLanguage();

  return (
    <GuestShell>
      <section className="px-5 pb-4 pt-7 text-center">
        <p className="font-serif text-[22px] italic leading-none text-[#5D514C]">
          {t("guest.welcome")}
        </p>
        <h1 className="mt-1 font-serif text-[38px] font-medium leading-none tracking-[-0.025em] text-[#2B1C17]">
          Dar LaMamy
        </h1>
        <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.34em] text-[#B28A47]">
          {t("guest.tagline")}
        </p>
      </section>

      <section className="px-4">
        <div className="relative aspect-[1.32/1] overflow-hidden rounded-[22px]">
          <Image
            src="/images/guest/dar-lamamy-courtyard.jpg"
            alt="Cour intérieure de Dar LaMamy à Fès"
            fill
            priority
            sizes="480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A120D]/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="max-w-[230px] font-serif text-[22px] font-medium leading-[1.05] text-white">
              L&apos;élégance d&apos;une maison fassie
            </p>
            <div className="mt-3 h-px w-9 bg-[#D2AA5A]" />
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="relative z-10 -mt-1 grid grid-cols-3 divide-x divide-[#B28A47]/12 rounded-b-[18px] border border-t-0 border-[#B28A47]/12 bg-[#FFFDF8] shadow-[0_16px_30px_-26px_rgba(35,20,12,0.35)]">
          <StayInfo icon={CalendarDays} label="Check-in" value={settings.checkIn || "À confirmer"} />
          <StayInfo icon={Wifi} label="Wi-Fi" value={settings.wifiName || "Sur demande"} />
          <StayInfo icon={Clock3} label="Séjour" value="Confirmé" highlighted />
        </div>
      </section>

      <section className="px-4 pb-4 pt-7">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#B28A47]">
              {t("guest.concierge")}
            </p>
            <h2 className="mt-1 font-serif text-[28px] font-medium leading-none text-[#2B1C17]">
              {t("guest.my_stay")}
            </h2>
          </div>
          <span className="mb-1 h-px w-10 bg-[#B28A47]/45" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {services.map((service, index) => (
            <GuestCard
              key={service.title}
              {...service}
              title={[
                t("guest.breakfast"),
                t("guest.transfer"),
                t("guest.discover_fes"),
                t("guest.whatsapp"),
                t("guest.request_service"),
                t("guest.riad_guide"),
              ][index]}
              href={
                index === 3 && settings.whatsapp
                  ? whatsappHref(
                      settings.whatsapp,
                      "Bonjour Dar LaMamy, j’ai une question concernant mon séjour.",
                    )
                  : service.href
              }
            />
          ))}
        </div>
      </section>

      <section className="px-4 py-4">
        <Link
          href="/guest/decouvrir-fes"
          className="group relative block min-h-[180px] overflow-hidden rounded-[20px]"
        >
          <Image
            src="/images/guest/fes-medina.jpg"
            alt="Médina de Fès"
            fill
            sizes="480px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#083D31]/90 via-[#083D31]/65 to-transparent" />

          <div className="relative z-10 flex min-h-[180px] flex-col justify-center px-6">
            <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-[#D2AA5A]">
              Fès
            </p>
            <h2 className="mt-2 max-w-[210px] font-serif text-[27px] font-medium leading-[1.05] text-white">
              Découvrez une ville millénaire
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/85">
              Explorer Fès
              <ChevronRight size={14} />
            </div>
          </div>
        </Link>
      </section>

      <section className="px-4 py-4">
        <div className="overflow-hidden rounded-[22px] border border-[#B28A47]/15 bg-[#F8F5EF] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F5A46] text-white">
              <MessageCircle size={19} strokeWidth={1.5} />
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#B28A47]">
                Votre concierge digital
              </p>
              <h2 className="mt-1 font-serif text-[23px] font-medium leading-tight text-[#2B1C17]">
                Une équipe dédiée à votre confort
              </h2>
              <p className="mt-2 text-[12px] leading-5 text-[#6F625C]">
                Besoin d&apos;un conseil, d&apos;une réservation ou d&apos;une attention
                particulière ? Nous sommes là pour vous.
              </p>
            </div>
          </div>

          <a
            href={whatsappHref(
              settings.whatsapp,
              "Bonjour Dar LaMamy, j’ai besoin d’aide pendant mon séjour.",
            )}
            target={settings.whatsapp ? "_blank" : undefined}
            rel={settings.whatsapp ? "noopener noreferrer" : undefined}
            className="mt-5 flex h-12 w-full items-center justify-between rounded-full bg-[#0F5A46] px-5 text-white transition hover:bg-[#083D31]"
          >
            <span className="flex items-center gap-2">
              <MessageCircle size={17} strokeWidth={1.5} />
              <span className="font-serif text-[16px] font-medium">Écrire sur WhatsApp</span>
            </span>
            <ChevronRight size={16} />
          </a>
        </div>
      </section>

      <section className="px-4 pb-6 pt-2">
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={phoneHref(settings.phone)}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#0F5A46]/15 text-[12px] font-semibold text-[#0F5A46]"
          >
            <Phone size={15} />
            {t("guest.call")}
          </a>

          <Link
            href="/guest/guide"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#B28A47]/20 text-[12px] font-semibold text-[#5D514C]"
          >
            <Compass size={15} className="text-[#B28A47]" />
            {t("guest.stay_guide")}
          </Link>
        </div>
      </section>
    </GuestShell>
  );
}

function StayInfo({
  icon: Icon,
  label,
  value,
  highlighted = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex min-h-[64px] items-center justify-center gap-2 px-2 py-3">
      <Icon
        size={16}
        strokeWidth={1.5}
        className={highlighted ? "text-[#0F5A46]" : "text-[#B28A47]"}
      />
      <div>
        <p className="text-[8px] leading-none text-[#6F625C]">{label}</p>
        <p
          className={`mt-1 text-[10px] font-semibold leading-none ${
            highlighted ? "text-[#0F5A46]" : "text-[#2B1C17]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
