"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  EXPERIENCE_ICON_CATEGORIES,
  EXPERIENCE_ICON_OPTIONS,
  type ExperienceIconCode,
} from "@/lib/experience-icons";
import {
  MAX_ROOM_COMFORT_FEATURES,
  type ComfortFeature,
  type ComfortLanguage,
  type ComfortText,
} from "@/lib/room-comfort";

type Props = {
  features: ComfortFeature[];
  language: ComfortLanguage;
  onChange: (features: ComfortFeature[]) => void;
};

function makeFeature(): ComfortFeature {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 18)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  return {
    id: `feature_${token}`,
    icon: "sparkles",
    fr: { title: "", description: "" },
    en: { title: "", description: "" },
  };
}

export function RoomComfortEditor({ features, language, onChange }: Props) {
  const setText = (id: string, key: keyof ComfortText, value: string) => {
    onChange(features.map((feature) => feature.id === id ? {
      ...feature,
      [language]: { ...feature[language], [key]: value },
    } : feature));
  };

  const setIcon = (id: string, icon: ExperienceIconCode) =>
    onChange(features.map((feature) => feature.id === id ? { ...feature, icon } : feature));

  const move = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= features.length) return;
    const ordered = [...features];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    onChange(ordered);
  };

  return (
    <section aria-labelledby="room-comfort-heading" className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 id="room-comfort-heading" className="font-serif text-xl font-medium text-[#2B1C17]">
            Équipements et confort
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#6F625C]">
            Ajoutez, supprimez et réorganisez les cartes de la page Chambres. Renseignez les titres en français et en anglais puis cliquez sur « Enregistrer ».
          </p>
          <p className="mt-1 text-xs text-[#6F625C]">
            {features.length} / {MAX_ROOM_COMFORT_FEATURES} éléments. Les changements ne sont publiés qu’après enregistrement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...features, makeFeature()])}
          disabled={features.length >= MAX_ROOM_COMFORT_FEATURES}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#0F5A46] px-4 text-xs font-semibold text-white transition hover:bg-[#0A4436] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} /> Ajouter un équipement
        </button>
      </div>

      {features.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[#B28A47]/30 bg-white p-4 text-sm text-[#6F625C]">
          Aucun élément. Vous pouvez en ajouter un avec le bouton ci-dessus.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {features.map((feature, index) => {
            const Icon = EXPERIENCE_ICON_OPTIONS.find(({ code }) => code === feature.icon)?.icon;
            return (
              <article key={feature.id} className="rounded-2xl border border-[#B28A47]/15 bg-white p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F5A46]/10 text-xs font-bold text-[#0F5A46]">{index + 1}</span>
                    {Icon ? <Icon size={18} aria-hidden="true" className="shrink-0 text-[#0F5A46]" /> : null}
                    <span className="truncate text-sm font-semibold text-[#2B1C17]">{feature[language].title || feature.fr.title || `Équipement ${index + 1}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button" aria-label={`Monter l’équipement ${index + 1}`} title="Monter"
                      onClick={() => move(index, -1)} disabled={index === 0}
                      className="rounded-lg border border-[#B28A47]/20 p-2 text-[#0F5A46] hover:bg-[#F7F3EB] disabled:opacity-30"
                    ><ArrowUp size={16} /></button>
                    <button
                      type="button" aria-label={`Descendre l’équipement ${index + 1}`} title="Descendre"
                      onClick={() => move(index, 1)} disabled={index === features.length - 1}
                      className="rounded-lg border border-[#B28A47]/20 p-2 text-[#0F5A46] hover:bg-[#F7F3EB] disabled:opacity-30"
                    ><ArrowDown size={16} /></button>
                    <button
                      type="button" aria-label={`Supprimer l’équipement ${index + 1}`} title="Supprimer"
                      onClick={() => onChange(features.filter(({ id }) => id !== feature.id))}
                      className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs font-semibold text-[#5D514C]">Icône</span>
                    <select
                      value={feature.icon}
                      onChange={(event) => setIcon(feature.id, event.target.value as ExperienceIconCode)}
                      className="h-11 w-full rounded-xl border border-[#B28A47]/20 bg-white px-3 text-sm text-[#2B1C17] outline-none focus:border-[#0F5A46]"
                    >
                      {EXPERIENCE_ICON_CATEGORIES.map((category) => (
                        <optgroup key={category.id} label={category.label}>
                          {EXPERIENCE_ICON_OPTIONS.filter(({ category: group }) => group === category.id).map(({ code, label }) => (
                            <option key={code} value={code}>{label} ({code})</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs font-semibold text-[#5D514C]">Titre ({language.toUpperCase()}) *</span>
                    <input
                      type="text" maxLength={200} value={feature[language].title}
                      onChange={(event) => setText(feature.id, "title", event.target.value)}
                      placeholder={language === "fr" ? "Ex. Literie confortable" : "E.g. Comfortable bedding"}
                      className="h-11 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm text-[#2B1C17] outline-none focus:border-[#0F5A46]"
                    />
                  </label>
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs font-semibold text-[#5D514C]">Description ({language.toUpperCase()})</span>
                    <textarea
                      rows={3} maxLength={2000} value={feature[language].description}
                      onChange={(event) => setText(feature.id, "description", event.target.value)}
                      placeholder={language === "fr" ? "Décrivez cet équipement..." : "Describe this feature..."}
                      className="w-full rounded-xl border border-[#B28A47]/20 px-3 py-2 text-sm leading-6 text-[#2B1C17] outline-none focus:border-[#0F5A46]"
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
