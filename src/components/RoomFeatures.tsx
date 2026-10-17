"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getExperienceIconOption } from "@/lib/experience-icons";
import {
  DEFAULT_ROOM_COMFORT_FEATURES,
  ROOM_COMFORT_FEATURES_SETTING_KEY,
  parseRoomComfortFeatures,
  validateRoomComfortFeatures,
  type ComfortFeature,
} from "@/lib/room-comfort";

export function RoomFeatures() {
  const { language, t } = useLanguage();
  const [savedFeatures, setSavedFeatures] = useState<ComfortFeature[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadFeatures = async () => {
      try {
        const response = await fetch("/api/public/content/sections?page=rooms", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const body = await response.json();
        const section = Array.isArray(body?.items)
          ? body.items.find((item: { section_key?: string }) => item.section_key === "comfort")
          : null;
        const raw = section?.settings?.[ROOM_COMFORT_FEATURES_SETTING_KEY];
        if (raw === undefined || validateRoomComfortFeatures(raw)) return;
        const parsed = parseRoomComfortFeatures(raw);
        if (!controller.signal.aborted && parsed) setSavedFeatures(parsed);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Chargement du contenu Confort impossible", error);
        }
      }
    };
    void loadFeatures();
    return () => controller.abort();
  }, []);

  const features = (savedFeatures ?? DEFAULT_ROOM_COMFORT_FEATURES).map((feature) => ({
    id: feature.id,
    icon: getExperienceIconOption(feature.icon).icon,
    title: feature[language].title,
    description: feature[language].description,
  }));

  return (
    <section className="py-12 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">{t("rooms.comfort.kicker")}</p>
        <h2 className="mt-2 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
          {t("rooms.comfort.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
          {t("rooms.comfort.description")}
        </p>
      </div>

      <div className="mt-9 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="flex gap-4 border-b border-[#B28A47]/15 py-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#FFFDF8]">
                <Icon size={17} className="text-[#0F5A46]" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[#2B1C17]">{feature.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-[#6F625C]">{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-[26px] bg-[#0F5A46] px-6 py-8 sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-9">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-[#D2AA5A]">
            <Sparkles size={16} strokeWidth={1.6} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">{t("rooms.comfort.banner.kicker")}</span>
          </div>
          <h3 className="mt-3 font-serif text-[28px] font-medium leading-tight text-[#FFFDF8] sm:text-[32px]">
            {t("rooms.comfort.banner.title")}
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-[#FFFDF8]/75 sm:text-[14px]">
            {t("rooms.comfort.banner.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
