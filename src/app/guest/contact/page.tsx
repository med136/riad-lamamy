"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import GuestPageHeader from "@/components/GuestPageHeader";
import GuestShell from "@/components/GuestShell";
import { useGuestSettings } from "@/components/guest/GuestProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { phoneHref, whatsappHref } from "@/lib/guest-config";

export default function GuestContactPage() {
  const { settings } = useGuestSettings();
  const { t } = useLanguage();

  return (
    <GuestShell>
      <GuestPageHeader
        kicker={t("guest.contact")}
        title={t("guest.contact_title")}
        description="Choisissez le moyen le plus simple pour contacter l’équipe Dar LaMamy pendant votre séjour."
      />

      <section className="space-y-3 px-4 pb-6">
        {settings.whatsapp ? (
          <ContactAction
            icon={MessageCircle}
            title="WhatsApp"
            subtitle="Pour une question ou une demande pendant votre séjour"
            href={whatsappHref(settings.whatsapp, "Bonjour Dar LaMamy, j’ai une question concernant mon séjour.")}
            external
          />
        ) : null}

        {settings.phone ? (
          <ContactAction icon={Phone} title="Téléphone" subtitle={settings.phone} href={phoneHref(settings.phone)} />
        ) : null}

        {settings.email ? (
          <ContactAction icon={Mail} title="E-mail" subtitle={settings.email} href={`mailto:${settings.email}`} />
        ) : null}

        {settings.address.length ? <div className="flex gap-3 rounded-[18px] border border-[#B28A47]/15 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5EF] text-[#0F5A46]">
            <MapPin size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-serif text-[19px] font-medium text-[#2B1C17]">Adresse</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6F625C]">
              {settings.address.join(" · ")}
            </p>
          </div>
        </div> : null}
      </section>
      <section className="px-4 pb-6"><ContactForm /></section>
    </GuestShell>
  );
}

function ContactAction({
  icon: Icon,
  title,
  subtitle,
  href,
  external = false,
}: {
  icon: typeof Phone;
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 rounded-[18px] border border-[#B28A47]/15 bg-white p-4 transition hover:border-[#B28A47]/35"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5EF] text-[#0F5A46]">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="font-serif text-[19px] font-medium text-[#2B1C17]">{title}</h2>
        <p className="mt-1 text-[12px] leading-5 text-[#6F625C]">{subtitle}</p>
      </div>
    </a>
  );
}
