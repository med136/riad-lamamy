export const HOME_SOUL_MEDIA_CLASS =
  "relative aspect-[4/3] max-h-[680px] overflow-hidden rounded-[26px] border border-[#B28A47]/25 bg-[#10251f] shadow-[0_30px_80px_-42px_rgba(35,20,12,0.36)] sm:aspect-[5/6]";

export const HOME_SOUL_TEXT_CLASS =
  "mt-7 space-y-5 pr-12 text-[15px] font-normal leading-[1.85] text-[#514842] sm:pr-0 sm:text-base";

export const HOME_SOUL_CTA_CLASS =
  "mt-8 inline-flex items-center gap-3 rounded-full bg-[#0F5A46] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(15,90,70,0.75)] transition hover:-translate-y-0.5 hover:bg-[#0B4436] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/60 focus-visible:ring-offset-2";

export const WHATSAPP_POSITION_CLASS =
  "fixed bottom-3 right-3 z-40 sm:bottom-6 sm:right-6";

export const WHATSAPP_BUTTON_SIZE_CLASS =
  "h-12 w-12 sm:h-[58px] sm:w-[58px]";

export function getSoulParagraphClass(index: number): string {
  return index === 2 ? "hidden sm:block" : "";
}

