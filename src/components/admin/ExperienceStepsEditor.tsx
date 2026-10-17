"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  EXPERIENCE_ICON_CATEGORIES,
  EXPERIENCE_ICON_OPTIONS,
  type ExperienceIconCode,
} from "@/lib/experience-icons";
import {
  MAX_EXPERIENCE_STEPS,
  type ExperienceLanguage,
  type ExperienceStep,
  type ExperienceStepText,
} from "@/lib/experience-steps";

type Props = {
  steps: ExperienceStep[];
  language: ExperienceLanguage;
  onChange: (steps: ExperienceStep[]) => void;
};

function newStep(): ExperienceStep {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 18)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: `step_${token}`,
    icon: "sparkles",
    fr: { time: "", title: "", description: "" },
    en: { time: "", title: "", description: "" },
  };
}

export function ExperienceStepsEditor({ steps, language, onChange }: Props) {
  const update = (id: string, field: keyof ExperienceStepText, value: string) => {
    onChange(steps.map((step) =>
      step.id === id
        ? { ...step, [language]: { ...step[language], [field]: value } }
        : step,
    ));
  };
  const setIcon = (id: string, icon: ExperienceIconCode) => {
    onChange(steps.map((step) => step.id === id ? { ...step, icon } : step));
  };
  const move = (index: number, offset: number) => {
    const destination = index + offset;
    if (destination < 0 || destination >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    onChange(reordered);
  };

  return (
    <section aria-labelledby="experience-steps-editor-heading" className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/45 p-4 sm:p-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 id="experience-steps-editor-heading" className="font-serif text-xl font-medium text-[#2B1C17]">
            Étapes de l’expérience
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#6F625C]">
            Ajoutez, modifiez, réorganisez ou supprimez les étapes. Les changements sont publiés avec « Enregistrer ».
          </p>
          <p className="mt-1 text-xs text-[#6F625C]">
            {steps.length} / {MAX_EXPERIENCE_STEPS} étapes · Complétez les titres en français et en anglais avant l’enregistrement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...steps, newStep()])}
          disabled={steps.length >= MAX_EXPERIENCE_STEPS}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#0F5A46] px-4 text-xs font-semibold text-white transition hover:bg-[#0B4436] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} /> Ajouter une étape
        </button>
      </div>

      {steps.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[#B28A47]/30 bg-white p-5 text-sm text-[#6F625C]">
          Aucune étape pour le moment. Cliquez sur « Ajouter une étape » pour en créer une.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {steps.map((step, index) => {
            const Icon = EXPERIENCE_ICON_OPTIONS.find((option) => option.code === step.icon)?.icon;
            return (
              <article key={step.id} className="rounded-2xl border border-[#B28A47]/20 bg-white p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F5A46]/10 text-xs font-bold text-[#0F5A46]">
                      {index + 1}
                    </span>
                    {Icon ? <Icon size={18} className="shrink-0 text-[#0F5A46]" aria-hidden="true" /> : null}
                    <span className="truncate text-sm font-semibold text-[#2B1C17]">
                      {step[language].title || step.fr.title || `Nouvelle étape ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button" onClick={() => move(index, -1)} disabled={index === 0}
                      title="Monter l’étape" aria-label={`Monter l’étape ${index + 1}`}
                      className="rounded-lg border border-[#B28A47]/20 p-2 text-[#0F5A46] hover:bg-[#F7F3EB] disabled:opacity-30"
                    ><ArrowUp size={16} /></button>
                    <button
                      type="button" onClick={() => move(index, 1)} disabled={index === steps.length - 1}
                      title="Descendre l’étape" aria-label={`Descendre l’étape ${index + 1}`}
                      className="rounded-lg border border-[#B28A47]/20 p-2 text-[#0F5A46] hover:bg-[#F7F3EB] disabled:opacity-30"
                    ><ArrowDown size={16} /></button>
                    <button
                      type="button" onClick={() => onChange(steps.filter((item) => item.id !== step.id))}
                      title="Supprimer l’étape" aria-label={`Supprimer l’étape ${index + 1}`}
                      className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"
                    ><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">
                    <span>Moment / horaire ({language.toUpperCase()})</span>
                    <input
                      type="text" maxLength={120} value={step[language].time}
                      onChange={(event) => update(step.id, "time", event.target.value)}
                      placeholder={language === "fr" ? "Ex. MATIN" : "E.g. MORNING"}
                      className="h-10 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm font-normal text-[#2B1C17] outline-none focus:border-[#0F5A46]"
                    />
                  </label>
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">
                    <span>Icône</span>
                    <select
                      value={step.icon}
                      onChange={(event) => setIcon(step.id, event.target.value as ExperienceIconCode)}
                      className="h-10 w-full rounded-xl border border-[#B28A47]/20 bg-white px-3 text-sm font-normal text-[#2B1C17] outline-none focus:border-[#0F5A46]"
                    >
                      {EXPERIENCE_ICON_CATEGORIES.map((category) => (
                        <optgroup key={category.id} label={category.label}>
                          {EXPERIENCE_ICON_OPTIONS.filter((option) => option.category === category.id).map((option) => (
                            <option key={option.code} value={option.code}>{option.label} ({option.code})</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C] sm:col-span-2">
                    <span>Titre ({language.toUpperCase()}) *</span>
                    <input
                      type="text" maxLength={200} value={step[language].title}
                      onChange={(event) => update(step.id, "title", event.target.value)}
                      placeholder={language === "fr" ? "Titre de l’étape" : "Step title"}
                      className="h-10 w-full rounded-xl border border-[#B28A47]/20 px-3 text-sm font-normal text-[#2B1C17] outline-none focus:border-[#0F5A46]"
                    />
                  </label>
                  <label className="block space-y-1 text-xs font-semibold text-[#5D514C] sm:col-span-2">
                    <span>Description ({language.toUpperCase()})</span>
                    <textarea
                      rows={3} maxLength={2000} value={step[language].description}
                      onChange={(event) => update(step.id, "description", event.target.value)}
                      placeholder={language === "fr" ? "Décrivez ce moment..." : "Describe this moment..."}
                      className="w-full rounded-xl border border-[#B28A47]/20 px-3 py-2 text-sm font-normal leading-6 text-[#2B1C17] outline-none focus:border-[#0F5A46]"
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
