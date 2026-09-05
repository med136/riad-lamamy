"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { MessageKey } from "@/lib/i18n";

const faqs = [
  {
    question: "contact.faq.booking.question" as MessageKey,
    answer: "contact.faq.booking.answer" as MessageKey,
  },
  {
    question: "contact.faq.transfer.question" as MessageKey,
    answer: "contact.faq.transfer.answer" as MessageKey,
  },
  {
    question: "contact.faq.fes.question" as MessageKey,
    answer: "contact.faq.fes.answer" as MessageKey,
  },
  {
    question: "contact.faq.request.question" as MessageKey,
    answer: "contact.faq.request.answer" as MessageKey,
  },
];

export default function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] px-6 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#B28A47]">
          {t("contact.faq.kicker")}
        </p>
        <h2 className="mt-2 font-serif text-[28px] font-medium text-[#2B1C17] sm:text-[32px]">
          {t("contact.faq.title")}
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-[#6F625C]">
          {t("contact.faq.description")}
        </p>
      </div>

      <div className="mx-auto mt-7 max-w-3xl divide-y divide-[#B28A47]/12 border-y border-[#B28A47]/12">
        {faqs.map((faq, index) => {
          const open = openIndex === index;

          return (
            <div key={faq.question}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-serif text-[18px] font-medium text-[#2B1C17] sm:text-[19px]">
                  {t(faq.question)}
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 text-[#0F5A46]">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.6}
                  />
                </span>
              </button>

              {open && (
                <div className="pb-5 pr-12">
                  <p className="text-[13px] leading-6 text-[#6F625C]">
                    {t(faq.answer)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px] text-[#6F625C]">
        {t("contact.faq.missing")} {" "}
        <Link
          href="/contact"
          className="font-semibold text-[#0F5A46] underline decoration-[#B28A47]/40 underline-offset-4"
        >
          {t("contact.faq.write")}
        </Link>
        .
      </p>
    </section>
  );
}
