"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";

export default function AboutHero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-[#F8F5EF]">
      <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[350px]">
        {/* Photo */}
        <div
          className="absolute inset-y-0 right-0 w-full bg-[url('/images/about/hero-darlamamy-about.jpeg')] bg-cover bg-center sm:w-[58%] lg:w-[47%] xl:w-[44%]"
          aria-hidden="true"
        />

        {/* Soft photo-to-ivory fade */}
        <div
          className="absolute inset-y-0 right-0 w-full bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.95)_10%,rgba(248,245,239,0.66)_24%,rgba(248,245,239,0.18)_46%,rgba(248,245,239,0)_68%)] sm:w-[58%] sm:bg-[linear-gradient(90deg,#F8F5EF_0%,rgba(248,245,239,0.94)_12%,rgba(248,245,239,0.52)_31%,rgba(248,245,239,0.08)_58%,rgba(248,245,239,0)_74%)] lg:w-[47%] xl:w-[44%]"
          aria-hidden="true"
        />

        {/* Subtle decoration */}
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rotate-45 border border-[#B28A47]/10"
          aria-hidden="true"
        />

        <div className="site-container relative flex min-h-[300px] items-center py-7 sm:min-h-[320px] sm:py-8 lg:min-h-[350px] lg:py-9">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[610px] text-center sm:w-[58%] lg:w-[53%]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0F5A46]">
              {t("about.kicker")}
            </p>

            <div className="mx-auto mt-3 flex w-[112px] items-center" aria-hidden="true">
              <span className="h-px flex-1 bg-[#B28A47]/45" />
              <span className="mx-3 h-[6px] w-[6px] rotate-45 border border-[#B28A47]/70" />
              <span className="h-px flex-1 bg-[#B28A47]/45" />
            </div>

            <h1 className="mt-5 font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] text-[#2B1C17] sm:text-[36px] lg:text-[40px] xl:text-[44px]">
              {t("about.hero.title")}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
              {t("about.hero.description")}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-[#6F625C]/80">
              <span>{t("about.hero.location")}</span>
              <span className="h-1 w-1 rotate-45 bg-[#B28A47]/60" aria-hidden="true" />
              <span>{t("about.hero.guesthouse")}</span>
              <span className="h-1 w-1 rotate-45 bg-[#B28A47]/60" aria-hidden="true" />
              <span>{t("about.hero.lifestyle")}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
