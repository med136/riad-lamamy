"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

type PublicContact = {
  email: string;
  phone: string;
  whatsapp?: string;
  address: string[];
};

const DEFAULT_CONTACT: PublicContact = {
  email: "contact@darlamamy.com",
  phone: "",
  whatsapp: undefined,
  address: ["Médina de Fès", "Fès, Maroc"],
};

export default function ContactInfo() {
  const [contact, setContact] = useState<PublicContact>(DEFAULT_CONTACT);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch("/api/public/settings", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) return;

        const data = await res.json();

        const email =
          typeof data.contact_email === "string" && data.contact_email.trim()
            ? data.contact_email.trim()
            : DEFAULT_CONTACT.email;

        const phone =
          typeof data.contact_phone === "string" && data.contact_phone.trim()
            ? data.contact_phone.trim()
            : "";

        const whatsapp =
          typeof data.whatsapp_phone === "string" && data.whatsapp_phone.trim()
            ? data.whatsapp_phone.trim()
            : undefined;

        const address: string[] = [];

        for (const value of [data.address_line_1, data.address_line_2]) {
          if (typeof value === "string" && value.trim()) address.push(value.trim());
        }

        const locality = [data.address_postal_code, data.address_city]
          .filter((value: unknown) => typeof value === "string" && value.trim())
          .map((value: unknown) => String(value).trim())
          .join(" ");

        if (locality) address.push(locality);

        if (typeof data.address_country === "string" && data.address_country.trim()) {
          address.push(data.address_country.trim());
        }

        setContact({
          email,
          phone,
          whatsapp,
          address: address.length ? address : DEFAULT_CONTACT.address,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Contact settings error:", error);
        }
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  const phoneHref = contact.phone.replace(/[^\d+]/g, "");
  const whatsappHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <section className="rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8] p-6 sm:p-7">
      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B28A47]">
        Dar LaMamy
      </p>
      <h2 className="mt-2 font-serif text-[26px] font-medium text-[#2B1C17]">
        Nous joindre
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-[#6F625C]">
        Choisissez le moyen qui vous convient pour échanger avec notre équipe.
      </p>

      <div className="mt-6 divide-y divide-[#B28A47]/12">
        {contact.phone && (
          <ContactRow
            icon={Phone}
            title="Téléphone"
            href={`tel:${phoneHref}`}
            value={contact.phone}
          />
        )}

        {whatsappHref && contact.whatsapp && (
          <ContactRow
            icon={MessageCircle}
            title="WhatsApp"
            href={whatsappHref}
            value={contact.whatsapp}
            external
          />
        )}

        <ContactRow
          icon={Mail}
          title="E-mail"
          href={`mailto:${contact.email}`}
          value={contact.email}
        />

        <div className="flex gap-3 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
            <MapPin className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B28A47]">
              Adresse
            </p>
            <div className="mt-1 text-[13px] leading-5 text-[#5D514C]">
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] bg-[#0F5A46] px-4 py-4 text-[#FFFDF8]">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D2AA5A]">
          Une demande particulière ?
        </p>
        <p className="mt-1 text-[12px] leading-5 text-white/75">
          Indiquez-la dans le formulaire : nous vous répondrons selon les informations
          et disponibilités du moment.
        </p>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  title,
  href,
  value,
  external = false,
}: {
  icon: typeof Phone;
  title: string;
  href: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex gap-3 py-4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF] transition group-hover:border-[#B28A47]/35">
        <Icon className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B28A47]">
          {title}
        </p>
        <p className="mt-1 break-words text-[13px] text-[#5D514C] transition group-hover:text-[#0F5A46]">
          {value}
        </p>
      </div>
    </a>
  );
}
