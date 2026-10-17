import {
  EXPERIENCE_ICON_OPTIONS,
  getExperienceIconOption,
  type ExperienceIconCode,
} from "./experience-icons.ts";

export const EXPERIENCE_STEPS_SETTING_KEY = "experienceSteps";
export const MAX_EXPERIENCE_STEPS = 20;

export type ExperienceLanguage = "fr" | "en";
export type ExperienceStepText = {
  time: string;
  title: string;
  description: string;
};
export type ExperienceStep = {
  id: string;
  icon: ExperienceIconCode;
  fr: ExperienceStepText;
  en: ExperienceStepText;
};

export const LEGACY_EXPERIENCE_MOMENTS = [
  { id: "morning", icon: "sunrise" },
  { id: "afternoon", icon: "compass" },
  { id: "evening", icon: "coffee" },
  { id: "night", icon: "moon" },
] as const satisfies readonly { id: string; icon: ExperienceIconCode }[];

const MAX_TEXT_LENGTH = { time: 120, title: 200, description: 2000 } as const;
const validIconCodes = new Set<string>(EXPERIENCE_ICON_OPTIONS.map((option) => option.code));

function parseText(value: unknown): ExperienceStepText | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  for (const field of ["time", "title", "description"] as const) {
    if (typeof fields[field] !== "string" || fields[field].length > MAX_TEXT_LENGTH[field]) {
      return null;
    }
  }
  return {
    time: fields.time as string,
    title: fields.title as string,
    description: fields.description as string,
  };
}

/**
 * Schema shared by the admin form and the public timeline. A missing setting
 * returns null (legacy four moments); an intentionally empty array is valid.
 * Editing may temporarily contain blank fields, validated before publishing.
 */
export function parseExperienceSteps(value: unknown): ExperienceStep[] | null {
  if (!Array.isArray(value) || value.length > MAX_EXPERIENCE_STEPS) return null;
  const steps: ExperienceStep[] = [];
  const ids = new Set<string>();

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const step = item as Record<string, unknown>;
    if (
      typeof step.id !== "string" ||
      !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(step.id) ||
      ids.has(step.id) ||
      typeof step.icon !== "string" ||
      !validIconCodes.has(step.icon)
    ) return null;

    const fr = parseText(step.fr);
    const en = parseText(step.en);
    if (!fr || !en) return null;
    ids.add(step.id);
    steps.push({
      id: step.id,
      icon: step.icon as ExperienceIconCode,
      fr,
      en,
    });
  }
  return steps;
}

export function validateExperienceSteps(value: unknown): string | null {
  const steps = parseExperienceSteps(value);
  if (!steps) return "La liste des étapes est invalide (codes, ordre ou longueur des textes).";
  if (steps.some(({ fr, en }) => !fr.title.trim() || !en.title.trim())) {
    return "Chaque étape doit avoir un titre en français et en anglais.";
  }
  return null;
}

/** Read the current effective CMS translations before migrating legacy cards. */
export function legacyExperienceSteps(
  read: (key: string, language: ExperienceLanguage) => string,
): ExperienceStep[] {
  return LEGACY_EXPERIENCE_MOMENTS.map(({ id, icon }) => ({
    id,
    icon: getExperienceIconOption(read(`home.experience.${id}_icon`, "fr"), icon).code as ExperienceIconCode,
    fr: {
      time: read(`home.experience.${id}_time`, "fr"),
      title: read(`home.experience.${id}_title`, "fr"),
      description: read(`home.experience.${id}_description`, "fr"),
    },
    en: {
      time: read(`home.experience.${id}_time`, "en"),
      title: read(`home.experience.${id}_title`, "en"),
      description: read(`home.experience.${id}_description`, "en"),
    },
  }));
}
