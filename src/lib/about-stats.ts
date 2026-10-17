import type { MessageKey } from "./i18n.ts";

/**
 * Stable stat keys shared by the public home preview and the CMS editor.
 * Values and captions are normal CMS translations and remain editable in FR/EN.
 */
export const ABOUT_STAT_DEFINITIONS = [
  {
    id: "experience",
    title: "Expérience",
    valueKey: "home.about.stats_experience_value",
    labelKey: "home.about.stats_experience_label",
  },
  {
    id: "rooms",
    title: "Chambres",
    valueKey: "home.about.stats_rooms_value",
    labelKey: "home.about.stats_rooms_label",
  },
  {
    id: "guests",
    title: "Voyageurs",
    valueKey: "home.about.stats_guests_value",
    labelKey: "home.about.stats_guests_label",
  },
  {
    id: "satisfaction",
    title: "Satisfaction",
    valueKey: "home.about.stats_satisfaction_value",
    labelKey: "home.about.stats_satisfaction_label",
  },
] as const satisfies readonly {
  id: string;
  title: string;
  valueKey: MessageKey;
  labelKey: MessageKey;
}[];

export const ABOUT_STAT_KEYS = new Set<string>(
  ABOUT_STAT_DEFINITIONS.flatMap(({ valueKey, labelKey }) => [valueKey, labelKey]),
);

export function getAboutStats(t: (key: MessageKey) => string) {
  return ABOUT_STAT_DEFINITIONS.map(({ id, valueKey, labelKey }) => ({
    id,
    value: t(valueKey),
    label: t(labelKey),
  }));
}
