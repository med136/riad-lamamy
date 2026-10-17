import {
  EXPERIENCE_ICON_OPTIONS,
  type ExperienceIconCode,
} from "./experience-icons.ts";

export type AboutSection = "values" | "team";
export type AboutLanguage = "fr" | "en";
export type AboutCardText = { kicker: string; title: string; description: string };
export type AboutCard = {
  id: string;
  icon: ExperienceIconCode;
  fr: AboutCardText;
  en: AboutCardText;
};
export const ABOUT_CARDS_SETTINGS_KEY = "cards";
export const MAX_ABOUT_CARDS = 20;

export const LEGACY_ABOUT_CARDS = {
  values: [
    { id: "authenticity", icon: "house" },
    { id: "welcome", icon: "heart" },
    { id: "detail", icon: "sparkles" },
    { id: "closeness", icon: "users" },
  ],
  team: [
    { id: "attentive", icon: "heart-handshake" },
    { id: "advice", icon: "message-circle" },
    { id: "tailored", icon: "sparkles" },
  ],
} as const satisfies Record<AboutSection, readonly { id: string; icon: ExperienceIconCode }[]>;

const VALID_ICONS = new Set<string>(EXPERIENCE_ICON_OPTIONS.map(({ code }) => code));
function asCardText(value: unknown): AboutCardText | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  if (
    typeof object.kicker !== "string" || object.kicker.length > 120 ||
    typeof object.title !== "string" || object.title.length > 200 ||
    typeof object.description !== "string" || object.description.length > 2000
  ) return null;
  return { kicker: object.kicker, title: object.title, description: object.description };
}

/**
 * Absent/unusable setting = unchanged legacy translated cards.
 * [] = intentionally no cards. Titles may be blank during editing only.
 */
export function parseAboutCards(value: unknown): AboutCard[] | null {
  if (!Array.isArray(value) || value.length > MAX_ABOUT_CARDS) return null;
  const result: AboutCard[] = [];
  const ids = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const raw = entry as Record<string, unknown>;
    if (
      typeof raw.id !== "string" ||
      !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(raw.id) ||
      ids.has(raw.id) ||
      typeof raw.icon !== "string" || !VALID_ICONS.has(raw.icon)
    ) return null;
    const fr = asCardText(raw.fr);
    const en = asCardText(raw.en);
    if (!fr || !en) return null;
    ids.add(raw.id);
    result.push({ id: raw.id, icon: raw.icon as ExperienceIconCode, fr, en });
  }
  return result;
}

export function validateAboutCards(value: unknown): string | null {
  const items = parseAboutCards(value);
  if (!items) return "La liste des cartes est invalide (icônes, identifiants ou longueur des textes).";
  if (items.some(({ fr, en }) => !fr.title.trim() || !en.title.trim())) {
    return "Chaque carte doit avoir un titre en français et en anglais.";
  }
  return null;
}

export function legacyAboutCards(
  section: AboutSection,
  read: (key: string, language: AboutLanguage) => string,
): AboutCard[] {
  return LEGACY_ABOUT_CARDS[section].map(({ id, icon }) => {
    const prefix = `about.${section}.${id}`;
    const get = (language: AboutLanguage): AboutCardText => ({
      kicker: section === "team" ? read(`${prefix}.kicker`, language) : "",
      title: read(`${prefix}.title`, language),
      description: read(`${prefix}.description`, language),
    });
    return { id, icon, fr: get("fr"), en: get("en") };
  });
}
