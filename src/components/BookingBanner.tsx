"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function BookingBanner() {
  const { t } = useLanguage();

  return (
    <section className="px-4 pb-5 sm:px-6 sm:pb-6">
      <div className="relative overflow-hidden rounded-[26px] bg-[#0F5A46] lg:rounded-[30px]">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-[#D2AA5A]/10" />
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[#D2AA5A]/10" />

        <div className="site-container relative z-10 flex flex-col gap-7 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D2AA5A]">Réservation directe</p>
            <h3 className="mt-3 font-serif text-[30px] font-medium leading-tight text-[#FFFDF8] sm:text-[36px]">
              {t("booking_banner.title")}
            </h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#FFFDF8]/75">
              {t("booking_banner.subtitle")}
            </p>

            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#FFFDF8]/70">
              <ShieldCheck size={15} className="text-[#D2AA5A]" strokeWidth={1.6} />
              Réservation directe avec Dar LaMamy
            </div>
          </div>

          <Link
            href="/reservations"
            className="group inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-[#D2AA5A]/50 px-6 text-[14px] font-semibold text-[#FFFDF8] transition hover:-translate-y-px hover:border-[#D2AA5A] hover:bg-[#FFFDF8] hover:text-[#0F5A46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2AA5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F5A46] sm:w-auto"
          >
            {t("booking_banner.book_now")}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" strokeWidth={1.7} />
          </Link>
        </div>
      </div>
    </section>
  );
}
