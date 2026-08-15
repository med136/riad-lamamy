import type { HeroMediaType } from "@/types/hero-media";

export const HERO_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const HERO_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export const HERO_MEDIA_ACCEPT = [
  ...HERO_IMAGE_MIME_TYPES,
  ...HERO_VIDEO_MIME_TYPES,
].join(",");

export const HERO_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const HERO_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

const EXTENSIONS_BY_MIME: Record<string, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "video/mp4": ["mp4"],
  "video/webm": ["webm"],
};

export type ValidatedHeroFile = {
  mediaType: HeroMediaType;
  extension: string;
};

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.slice(start, start + length));

const hasValidSignature = (mimeType: string, bytes: Uint8Array) => {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      ascii(bytes, 1, 3) === "PNG" &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP";
  }
  if (mimeType === "image/avif") {
    return ascii(bytes, 4, 4) === "ftyp" && /^(avif|avis)$/.test(ascii(bytes, 8, 4));
  }
  if (mimeType === "video/mp4") {
    return ascii(bytes, 4, 4) === "ftyp";
  }
  if (mimeType === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
};

export const validateHeroFile = async (
  file: File,
  expectedType?: HeroMediaType,
): Promise<ValidatedHeroFile> => {
  const mediaType: HeroMediaType | null = HERO_IMAGE_MIME_TYPES.includes(
    file.type as (typeof HERO_IMAGE_MIME_TYPES)[number],
  )
    ? "image"
    : HERO_VIDEO_MIME_TYPES.includes(
          file.type as (typeof HERO_VIDEO_MIME_TYPES)[number],
        )
      ? "video"
      : null;

  if (!mediaType || (expectedType && mediaType !== expectedType)) {
    throw new Error("Format de média non autorisé.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!EXTENSIONS_BY_MIME[file.type]?.includes(extension)) {
    throw new Error("L’extension du fichier ne correspond pas à son type MIME.");
  }

  const maxBytes = mediaType === "image" ? HERO_IMAGE_MAX_BYTES : HERO_VIDEO_MAX_BYTES;
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(
      mediaType === "image"
        ? "L’image doit peser au maximum 10 Mo."
        : "La vidéo doit peser au maximum 50 Mo.",
    );
  }

  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  if (!hasValidSignature(file.type, header)) {
    throw new Error("La signature réelle du fichier ne correspond pas au format annoncé.");
  }

  return { mediaType, extension };
};

export const isAllowedHeroStorageUrl = (value: string) => {
  try {
    const storageBase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const candidate = new URL(value);
    const secureProtocol =
      candidate.protocol === "https:" ||
      (candidate.protocol === "http:" && ["localhost", "127.0.0.1"].includes(storageBase.hostname));
    return (
      secureProtocol &&
      candidate.host === storageBase.host &&
      candidate.pathname.includes("/storage/v1/object/public/room-images/hero/")
    );
  } catch {
    return false;
  }
};

export const getHeroStorageObjectPath = (value: string) => {
  if (!isAllowedHeroStorageUrl(value)) return null;
  const marker = "/storage/v1/object/public/room-images/";
  const pathname = new URL(value).pathname;
  const markerIndex = pathname.indexOf(marker);
  return markerIndex >= 0 ? decodeURIComponent(pathname.slice(markerIndex + marker.length)) : null;
};
