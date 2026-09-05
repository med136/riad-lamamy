"use client";

import { useEffect, useState } from "react";
import { BellRing, MessageCircle } from "lucide-react";
import GuestPageHeader from "@/components/GuestPageHeader";
import GuestShell from "@/components/GuestShell";
import { useGuestSettings } from "@/components/guest/GuestProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { whatsappHref } from "@/lib/guest-config";

type Service = { id: string; name: string; description: string | null };

function isService(value: unknown): value is Service {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.name === "string" &&
    (typeof item.description === "string" || item.description === null);
}

export default function ServicesPage() {
  const { settings } = useGuestSettings();
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadServices() {
      try {
        const response = await fetch("/api/services", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;
        const items = (payload as Record<string, unknown>).services;
        if (Array.isArray(items)) setServices(items.filter(isService));
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") console.error("Guest services error:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadServices();
    return () => controller.abort();
  }, []);

  return (
    <GuestShell>
      <GuestPageHeader kicker="Services" title={t("guest.services_title")} description="Retrouvez les services actuellement proposés par l’équipe Dar LaMamy." />
      <section className="grid grid-cols-1 gap-3 px-4 min-[360px]:grid-cols-2" aria-busy={loading}>
        {services.map((service) => {
          const href = whatsappHref(settings.whatsapp, `Bonjour Dar LaMamy, je souhaite obtenir des informations concernant le service : ${service.name}.`);
          return (
            <article key={service.id} className="flex min-h-44 flex-col rounded-[18px] border border-[#B28A47]/15 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F5EF] text-[#0F5A46]"><BellRing size={18} strokeWidth={1.5} /></div>
              <h2 className="mt-3 font-serif text-[18px] font-medium leading-tight text-[#2B1C17]">{service.name}</h2>
              {service.description ? <p className="mt-1.5 text-[11px] leading-5 text-[#6F625C]">{service.description}</p> : null}
              <a href={href} target={settings.whatsapp ? "_blank" : undefined} rel={settings.whatsapp ? "noopener noreferrer" : undefined} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-3 text-[11px] font-semibold text-[#0F5A46] focus-visible:outline-none focus-visible:underline"><MessageCircle size={15} strokeWidth={1.5} />{t("guest.request")}</a>
            </article>
          );
        })}
        {!loading && services.length === 0 ? (
          <div className="col-span-full rounded-[18px] border border-[#B28A47]/15 bg-white p-5 text-center">
            <p className="text-[13px] leading-6 text-[#6F625C]">Les services disponibles vous seront confirmés par notre équipe.</p>
            <a href="/guest/contact" className="mt-3 inline-flex min-h-11 items-center text-[12px] font-semibold text-[#0F5A46]">{t("guest.contact_team")}</a>
          </div>
        ) : null}
      </section>
    </GuestShell>
  );
}
