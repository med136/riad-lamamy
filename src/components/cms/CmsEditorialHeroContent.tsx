"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { MessageKey } from "@/lib/i18n";

export function CmsEditorialHeroContent({
  kickerKey,
  titleKey,
  subtitleKey,
  tagKeys = [],
}: {
  kickerKey: MessageKey;
  titleKey: MessageKey;
  subtitleKey: MessageKey;
  tagKeys?: MessageKey[];
}) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-[650px] text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.30em] text-[#0F5A46] sm:text-[10px]">
        {t(kickerKey)}
      </p>

      <div className="mx-auto mt-2.5 flex w-[120px] items-center" aria-hidden="true">
        <span className="h-px flex-1 bg-[#B28A47]/55" />
        <span className="mx-3 h-[6px] w-[6px] rotate-45 border border-[#B28A47] bg-[#F8F5EF]" />
        <span className="h-px flex-1 bg-[#B28A47]/55" />
      </div>

      <h1 className="mt-5 font-serif text-[32px] font-medium leading-[1.03] tracking-[-0.012em] text-[#2B1C17] sm:text-[36px] lg:text-[40px] xl:text-[44px]">
        {t(titleKey)}
      </h1>

      <div className="mx-auto mt-4 flex w-[145px] items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#B28A47]/40" />
        <div className="relative h-3.5 w-3.5">
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#B28A47]" />
          <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#B28A47]" />
        </div>
        <span className="h-px flex-1 bg-[#B28A47]/40" />
      </div>

      <p className="mx-auto mt-4 max-w-[510px] text-[13px] leading-6 text-[#5D514C] sm:text-[14px] lg:text-[15px]">
        {t(subtitleKey)}
      </p>

      {tagKeys.length > 0 ? (
        <div className="mt-4 hidden items-center justify-center gap-4 text-[10px] text-[#6F625C] sm:flex">
          {tagKeys.map((key, index) => (
            <span key={key} className="contents">
              {index > 0 ? <span className="h-3 w-px bg-[#B28A47]/25" aria-hidden="true" /> : null}
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#B28A47]" aria-hidden="true" />
                {t(key)}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
