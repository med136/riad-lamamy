"use client";

import { ABOUT_STAT_DEFINITIONS } from "@/lib/about-stats";
import { baseMessages, type Language, type MessageKey } from "@/lib/i18n";

type Translation = {
  key: string;
  fr: string;
  en: string;
};

export function AboutStatsEditor({
  translations,
  language,
  onChange,
}: {
  translations: Translation[];
  language: Language;
  onChange: (key: string, value: string) => void;
}) {
  const read = (key: MessageKey) =>
    translations.find((item) => item.key === key)?.[language] ?? baseMessages[language][key];

  return (
    <section aria-labelledby="about-stats-heading" className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4 sm:p-5">
      <div>
        <h3 id="about-stats-heading" className="font-serif text-xl font-medium text-[#2B1C17]">
          Chiffres clés — Notre histoire
        </h3>
        <p className="mt-1 text-xs leading-5 text-[#6F625C]">
          Modifiez les quatre chiffres et leurs légendes. Utilisez Français / English en haut de la section,
          puis cliquez sur « Enregistrer ». Les valeurs actuelles restent inchangées tant que vous ne les modifiez pas.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ABOUT_STAT_DEFINITIONS.map((stat, index) => (
          <div key={stat.id} className="rounded-2xl border border-[#B28A47]/15 bg-white p-4">
            <p className="mb-3 text-xs font-semibold text-[#0F5A46]">{index + 1}. {stat.title}</p>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[#5D514C]">Chiffre / valeur ({language.toUpperCase()})</span>
              <input
                type="text"
                maxLength={100}
                value={read(stat.valueKey)}
                onChange={(event) => onChange(stat.valueKey, event.target.value)}
                placeholder="Ex. 15 ans, 98 %"
                className="h-11 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm text-[#2B1C17] outline-none focus:border-[#0F5A46]/55 focus:ring-2 focus:ring-[#0F5A46]/10"
              />
            </label>
            <label className="mt-3 block space-y-1">
              <span className="text-xs font-medium text-[#5D514C]">Légende ({language.toUpperCase()})</span>
              <input
                type="text"
                maxLength={150}
                value={read(stat.labelKey)}
                onChange={(event) => onChange(stat.labelKey, event.target.value)}
                placeholder="Ex. chambres uniques"
                className="h-11 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm text-[#2B1C17] outline-none focus:border-[#0F5A46]/55 focus:ring-2 focus:ring-[#0F5A46]/10"
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
