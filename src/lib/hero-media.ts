import type { HeroMediaType } from "@/types/hero-media";

export const HERO_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const HERO_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export const HERO_MEDIA_ACCEPT = [
  ...HERO_IMAGE_MIME_TYPES,
  ...HERO_VIDEO_MIME_TYPES,
].join(",");

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const HERO_IMAGE_MAX_BYTES = MAX_IMAGE_SIZE;
export const HERO_VIDEO_MAX_BYTES = MAX_VIDEO_SIZE;

export class HeroMediaValidationError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "HeroMediaValidationError";
  }
}

const EXTENSIONS_BY_MIME: Record<string, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
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
    throw new HeroMediaValidationError("Format de média non autorisé.", 415);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!EXTENSIONS_BY_MIME[file.type]?.includes(extension)) {
    throw new HeroMediaValidationError("L’extension du fichier ne correspond pas à son type MIME.", 415);
  }

  const maxBytes = mediaType === "image" ? HERO_IMAGE_MAX_BYTES : HERO_VIDEO_MAX_BYTES;
  if (file.size <= 0 || file.size > maxBytes) {
    throw new HeroMediaValidationError(
      mediaType === "image"
        ? "Image trop volumineuse. Taille maximale : 8 Mo."
        : "Vidéo trop volumineuse. Taille maximale : 50 Mo.",
      413,
    );
  }

  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  if (!hasValidSignature(file.type, header)) {
    throw new HeroMediaValidationError("La signature réelle du fichier ne correspond pas au format annoncé.", 415);
  }

  return { mediaType, extension };
};
