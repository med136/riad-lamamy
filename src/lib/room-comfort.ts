import {
  EXPERIENCE_ICON_OPTIONS,
  type ExperienceIconCode,
} from "./experience-icons.ts";

export const ROOM_COMFORT_FEATURES_SETTING_KEY = "comfortFeatures";
export const MAX_ROOM_COMFORT_FEATURES = 20;

export type ComfortLanguage = "fr" | "en";
export type ComfortText = { title: string; description: string };
export type ComfortFeature = {
  id: string;
  icon: ExperienceIconCode;
  fr: ComfortText;
  en: ComfortText;
};

/** The existing six French cards are preserved exactly as the default. */
export const DEFAULT_ROOM_COMFORT_FEATURES: ComfortFeature[] = [
  {
    id: "thermal",
    icon: "thermometer-sun",
    fr: {
      title: "Confort thermique",
      description: "Une atmosphère agréable pensée pour votre confort tout au long du séjour.",
    },
    en: {
      title: "Thermal comfort",
      description: "A pleasant atmosphere designed for your comfort throughout your stay.",
    },
  },
  {
    id: "wifi",
    icon: "wifi",
    fr: {
      title: "Connexion Wi-Fi",
      description: "Une connexion disponible pour rester connecté simplement pendant votre séjour.",
    },
    en: {
      title: "Wi-Fi connection",
      description: "A connection to help you stay online during your stay.",
    },
  },
  {
    id: "privacy",
    icon: "lock",
    fr: {
      title: "Tranquillité",
      description: "Des espaces conçus pour préserver votre intimité et votre sérénité.",
    },
    en: {
      title: "Peace and quiet",
      description: "Spaces designed to preserve your privacy and peace of mind.",
    },
  },
  {
    id: "bathroom",
    icon: "droplets",
    fr: {
      title: "Salle de bain",
      description: "Des équipements fonctionnels et soignés dans un esprit sobre et confortable.",
    },
    en: {
      title: "Bathroom",
      description: "Thoughtful, functional amenities in an understated, comfortable setting.",
    },
  },
  {
    id: "hospitality",
    icon: "coffee",
    fr: {
      title: "Hospitalité",
      description: "Des attentions simples et chaleureuses pour accompagner votre expérience à Fès.",
    },
    en: {
      title: "Hospitality",
      description: "Simple, warm touches to enhance your time in Fès.",
    },
  },
  {
    id: "personalized",
    icon: "heart",
    fr: {
      title: "Séjour personnalisé",
      description: "Notre équipe reste disponible pour vous conseiller avant et pendant votre séjour.",
    },
    en: {
      title: "Personalised stay",
      description: "Our team is available to advise you before and during your stay.",
    },
  },
];

const VALID_ICONS = new Set<string>(EXPERIENCE_ICON_OPTIONS.map(({ code }) => code));
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

function parseText(raw: unknown): ComfortText | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.title !== "string" || obj.title.length > 200 ||
    typeof obj.description !== "string" || obj.description.length > 2000
  ) return null;
  return { title: obj.title, description: obj.description };
}

/** null = no valid saved configuration, so use the six original cards. */
export function parseRoomComfortFeatures(value: unknown): ComfortFeature[] | null {
  if (!Array.isArray(value) || value.length > MAX_ROOM_COMFORT_FEATURES) return null;
  const ids = new Set<string>();
  const parsed: ComfortFeature[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const raw = item as Record<string, unknown>;
    if (
      typeof raw.id !== "string" || !ID_PATTERN.test(raw.id) || ids.has(raw.id) ||
      typeof raw.icon !== "string" || !VALID_ICONS.has(raw.icon)
    ) return null;
    const fr = parseText(raw.fr);
    const en = parseText(raw.en);
    if (!fr || !en) return null;
    ids.add(raw.id);
    parsed.push({ id: raw.id, icon: raw.icon as ExperienceIconCode, fr, en });
  }
  return parsed;
}

export function validateRoomComfortFeatures(value: unknown): string | null {
  const parsed = parseRoomComfortFeatures(value);
  if (!parsed) return "Les équipements Confort contiennent des données invalides.";
  if (parsed.some((item) => !item.fr.title.trim() || !item.en.title.trim())) {
    return "Chaque équipement doit avoir un titre en français et en anglais.";
  }
  return null;
}
