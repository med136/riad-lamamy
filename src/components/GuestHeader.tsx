"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function GuestHeader() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-[#B28A47]/10 bg-[#FFFDF8]/95 px-5 backdrop-blur-xl">
      <Link href="/guest" className="flex items-center gap-3" aria-label="Dar LaMamy">
        <div className="relative h-11 w-11 shrink-0">
          <Image
            src="/logo-mark.png"
            alt=""
            fill
            sizes="44px"
            className="object-contain"
            priority
          />
        </div>

        <div>
          <div className="font-serif text-[20px] font-medium leading-none tracking-[0.04em] text-[#2B1C17]">
            Dar LaMamy
          </div>
          <div className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.34em] text-[#B28A47]">
            Fès · Maroc
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          aria-label={language === "fr" ? "Switch to English" : "Passer en français"}
          className="flex h-10 min-w-10 items-center justify-center rounded-full border border-[#B28A47]/15 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#0F5A46] transition hover:bg-[#F8F5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/55"
        >
          {language === "fr" ? "EN" : "FR"}
        </button>
        <Link
          href="/guest/guide"
          aria-label={language === "fr" ? "Guide du séjour" : "Stay guide"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B28A47]/15 text-[#2B1C17] transition hover:bg-[#F8F5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/55"
        >
          <BookOpen size={19} strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
}
