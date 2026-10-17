"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { IconPicker } from "@/components/admin/ServiceFeatureEditor";
import {
  MAX_ABOUT_CARDS,
  type AboutCard,
  type AboutLanguage,
  type AboutSection,
  type AboutCardText,
} from "@/lib/about-cards";
import { getExperienceIconOption, type ExperienceIconCode } from "@/lib/experience-icons";

type Props = {
  section: AboutSection;
  language: AboutLanguage;
  items: AboutCard[];
  onChange: (items: AboutCard[]) => void;
};

function newCard(): AboutCard {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 18)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const text = { kicker: "", title: "", description: "" };
  return { id: `card_${token}`, icon: "sparkles", fr: { ...text }, en: { ...text } };
}

export function AboutCardsEditor({ section, items, language, onChange }: Props) {
  const move = (index: number, direction: number) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  };
  const setText = (id: string, field: keyof AboutCardText, value: string) =>
    onChange(items.map((item) => item.id === id
      ? { ...item, [language]: { ...item[language], [field]: value } }
      : item));
  const setIcon = (id: string, icon: ExperienceIconCode) =>
    onChange(items.map((item) => item.id === id ? { ...item, icon } : item));

  return (
    <section aria-labelledby="about-cards-editor-heading" className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="about-cards-editor-heading" className="font-serif text-xl font-medium text-[#2B1C17]">
            {section === "values" ? "Cartes — Nos valeurs" : "Cartes — Esprit de la maison"}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#6F625C]">
            {items.length} / {MAX_ABOUT_CARDS} cartes · Modifiez les deux langues avant d’enregistrer.
            Les cartes existantes restent inchangées jusqu’à votre premier enregistrement.
          </p>
        </div>
        <button
          type="button" onClick={() => onChange([...items, newCard()])}
          disabled={items.length >= MAX_ABOUT_CARDS}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0F5A46] px-4 text-xs font-semibold text-white hover:bg-[#0B4436] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} /> Ajouter une carte
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[#B28A47]/25 bg-white p-4 text-sm text-[#6F625C]">
          Aucune carte. Utilisez « Ajouter une carte » pour en créer une.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => {
            const Icon = getExperienceIconOption(item.icon).icon;
            return (
              <article key={item.id} className="rounded-xl border border-[#B28A47]/15 bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5A46]/10 text-xs font-bold text-[#0F5A46]">{index + 1}</span>
                    <Icon className="h-4 w-4 shrink-0 text-[#0F5A46]" aria-hidden="true" />
                    <span className="truncate text-sm font-semibold text-[#2B1C17]">{item[language].title || item.fr.title || "Nouvelle carte"}</span>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                      title="Monter" aria-label={`Monter la carte ${index + 1}`}
                      className="rounded-lg border border-[#B28A47]/20 p-2 text-[#0F5A46] disabled:opacity-30"><ArrowUp size={16}/></button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}
                      title="Descendre" aria-label={`Descendre la carte ${index + 1}`}
                      className="rounded-lg border border-[#B28A47]/20 p-2 text-[#0F5A46] disabled:opacity-30"><ArrowDown size={16}/></button>
                    <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
                      title="Supprimer" aria-label={`Supprimer la carte ${index + 1}`}
                      className="rounded-lg border border-rose-200 p-2 text-rose-700"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">
                    Icône
                    <IconPicker value={item.icon} onChange={(icon) => setIcon(item.id, icon)}/>
                  </label>
                  {section === "team" ? (
                    <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">
                      Accroche ({language.toUpperCase()})
                      <input type="text" maxLength={120} value={item[language].kicker}
                        onChange={(event) => setText(item.id, "kicker", event.target.value)}
                        className="h-10 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm font-normal"/>
                    </label>
                  ) : null}
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">
                    Titre ({language.toUpperCase()}) *
                    <input type="text" maxLength={200} value={item[language].title}
                      onChange={(event) => setText(item.id, "title", event.target.value)}
                      className="h-10 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm font-normal"/>
                  </label>
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">
                    Description ({language.toUpperCase()})
                    <textarea rows={3} maxLength={2000} value={item[language].description}
                      onChange={(event) => setText(item.id, "description", event.target.value)}
                      className="w-full rounded-xl border border-[#B28A47]/20 px-3 py-2 text-sm font-normal"/>
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
