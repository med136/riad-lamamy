export const SOUL_SECTION_KEY = "soul";
export const SOUL_VIDEO_FALLBACK = "/video/darlamamy.mp4";
export const SOUL_POSTER_FALLBACK = "/riad-login-courtyard.png";
export const MAX_SOUL_VIDEO_BYTES = 45 * 1024 * 1024;
export const ALLOWED_SOUL_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export type SoulSettings = {
  videoUrl?: string;
  posterUrl?: string;
  ctaHref?: string;
  showCta?: boolean;
};

export function isSafeSoulLink(value: unknown): value is string {
  return typeof value === "string" &&
    value.length <= 200 &&
    /^\/(?!\/)[a-zA-Z0-9/_?&=#.%+~-]*$/.test(value);
}

function isAllowedSoulMedia(value: unknown, type: "video" | "poster"): boolean {
  if (typeof value !== "string" || value.length > 2000) return false;
  if (!value) return true; // reset to default
  if (value.startsWith("/") && !value.startsWith("//")) {
    return type === "video"
      ? /^\/video\/[a-zA-Z0-9/_-]+\.(mp4|webm)$/.test(value)
      : /^\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp|avif)$/.test(value);
  }
  try {
    const url = new URL(value);
    const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : null;
    const path = url.pathname;
    return url.protocol === "https:" && url.origin === supabaseOrigin &&
      /^\/storage\/v1\/object\/public\/(public|room-images)\/cms\/home\/soul\/[a-zA-Z0-9/_-]+\.(mp4|webm|png|jpg|jpeg|webp|avif)$/.test(path) &&
      (type === "video" ? /\.(mp4|webm)$/.test(path) : /\.(png|jpg|jpeg|webp|avif)$/.test(path)) &&
      !url.search && !url.hash;
  } catch {
    return false;
  }
}

export function validateSoulSettings(settings: Record<string, unknown>): string | null {
  if (Object.hasOwn(settings, "videoUrl") && !isAllowedSoulMedia(settings.videoUrl, "video"))
    return "Source vidéo invalide : choisissez une vidéo MP4/WebM depuis l’administration.";
  if (Object.hasOwn(settings, "posterUrl") && !isAllowedSoulMedia(settings.posterUrl, "poster"))
    return "Image de couverture invalide.";
  if (Object.hasOwn(settings, "ctaHref") && !isSafeSoulLink(settings.ctaHref))
    return "Lien invalide : utilisez un chemin interne tel que /chambres.";
  if (Object.hasOwn(settings, "showCta") && typeof settings.showCta !== "boolean")
    return "L’option d’affichage du bouton est invalide.";
  return null;
}

export function getSoulSettings(settings: Record<string, unknown> | null | undefined = undefined): Required<SoulSettings> {
  const data = settings ?? {};
  return {
    videoUrl: typeof data.videoUrl === "string" && isAllowedSoulMedia(data.videoUrl, "video") && data.videoUrl
      ? data.videoUrl : SOUL_VIDEO_FALLBACK,
    posterUrl: typeof data.posterUrl === "string" && isAllowedSoulMedia(data.posterUrl, "poster") && data.posterUrl
      ? data.posterUrl : SOUL_POSTER_FALLBACK,
    ctaHref: isSafeSoulLink(data.ctaHref) ? data.ctaHref : "/chambres",
    showCta: typeof data.showCta === "boolean" ? data.showCta : true,
  };
}
