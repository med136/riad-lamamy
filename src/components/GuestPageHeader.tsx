"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function GuestPageHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  const { t } = useLanguage();
  return (
    <section className="px-5 pb-6 pt-6">
      <Link
        href="/guest"
        className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#0F5A46]"
      >
        <ArrowLeft size={15} strokeWidth={1.6} />
        {t("guest.back")}
      </Link>

      <p className="mt-6 text-[8px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">
        {kicker}
      </p>

      <h1 className="mt-2 font-serif text-[34px] font-medium leading-[1.04] tracking-[-0.02em] text-[#2B1C17]">
        {title}
      </h1>

      {description && (
        <p className="mt-3 text-[13px] leading-6 text-[#6F625C]">
          {description}
        </p>
      )}
    </section>
  );
}
