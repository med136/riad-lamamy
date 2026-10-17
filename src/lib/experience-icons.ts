import {
  Coffee,
  Compass,
  Heart,
  MapPin,
  Moon,
  Sparkles,
  Star,
  Sunrise,
  type LucideIcon,
} from "lucide-react";

export type ExperienceIconCode =
  | "sunrise"
  | "compass"
  | "coffee"
  | "moon"
  | "star"
  | "heart"
  | "map-pin"
  | "sparkles";

export type ExperienceIconOption = {
  code: ExperienceIconCode;
  icon: LucideIcon;
};

export const EXPERIENCE_ICON_OPTIONS: readonly ExperienceIconOption[] = [
  { code: "sunrise", icon: Sunrise },
  { code: "compass", icon: Compass },
  { code: "coffee", icon: Coffee },
  { code: "moon", icon: Moon },
  { code: "star", icon: Star },
  { code: "heart", icon: Heart },
  { code: "map-pin", icon: MapPin },
  { code: "sparkles", icon: Sparkles },
];

const DEFAULT_ICON_CODE: ExperienceIconCode = "sparkles";

export function getExperienceIconOption(
  code: string | null | undefined,
  fallbackCode: ExperienceIconCode = DEFAULT_ICON_CODE,
): ExperienceIconOption {
  const normalizedCode = code?.trim().toLowerCase();
  const requestedIcon = EXPERIENCE_ICON_OPTIONS.find(
    (option) => option.code === normalizedCode,
  );

  return (
    requestedIcon ??
    EXPERIENCE_ICON_OPTIONS.find((option) => option.code === fallbackCode) ??
    EXPERIENCE_ICON_OPTIONS[EXPERIENCE_ICON_OPTIONS.length - 1]
  );
}

