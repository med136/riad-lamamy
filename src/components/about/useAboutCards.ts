"use client";

import { useEffect, useState } from "react";
import { ABOUT_CARDS_SETTINGS_KEY, parseAboutCards, validateAboutCards, type AboutCard, type AboutSection } from "@/lib/about-cards";

/** Missing CMS settings preserve the current translated default cards. */
export function useAboutCards(sectionKey: AboutSection): AboutCard[] | null {
  const [saved, setSaved] = useState<AboutCard[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/public/content/sections?page=about", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const body = await response.json();
        const section = Array.isArray(body.items)
          ? body.items.find((item: { section_key?: string }) => item.section_key === sectionKey)
          : null;
        const raw = section?.settings?.[ABOUT_CARDS_SETTINGS_KEY];
        if (raw === undefined || validateAboutCards(raw)) return;
        const cards = parseAboutCards(raw);
        if (!controller.signal.aborted && cards) setSaved(cards);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Chargement des cartes À propos impossible", error);
      }
    })();
    return () => controller.abort();
  }, [sectionKey]);

  return saved;
}
