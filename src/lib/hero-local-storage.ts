import { randomBytes } from "node:crypto";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateHeroFile, type ValidatedHeroFile } from "@/lib/hero-media";
import type { HeroMediaType } from "@/types/hero-media";

export const HERO_UPLOAD_URL_PREFIX = "/uploads/hero";

const CATEGORY_BY_TYPE = {
  image: "images",
  video: "videos",
} as const;

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

const SAFE_FILENAME = /^hero-\d{13}-[a-f0-9]{16}\.(?:jpe?g|png|webp|mp4|webm)$/;

export class HeroStorageError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HeroStorageError";
  }
}

export type StoredHeroMedia = {
  url: string;
  type: HeroMediaType;
  filename: string;
  mimeType: string;
  size: number;
};

export const getHeroUploadRoot = () =>
  path.resolve(
    process.env.HERO_UPLOAD_ROOT || path.join(process.cwd(), "..", "uploads", "hero"),
  );

const assertInsideRoot = (candidate: string) => {
  const root = getHeroUploadRoot();
  const relative = path.relative(root, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new HeroStorageError("Chemin de média Hero invalide.", 400);
  }
  return candidate;
};

const resolveFilePath = (category: "images" | "videos", filename: string) => {
  if (!SAFE_FILENAME.test(filename) || filename.includes("..")) {
    throw new HeroStorageError("Nom de fichier Hero invalide.", 400);
  }
  return assertInsideRoot(path.resolve(getHeroUploadRoot(), category, filename));
};

const createFilename = (validated: ValidatedHeroFile) =>
  `hero-${Date.now()}-${randomBytes(8).toString("hex")}.${validated.extension}`;

export const storeHeroMedia = async (
  file: File,
  expectedType?: HeroMediaType,
): Promise<StoredHeroMedia> => {
  const validated = await validateHeroFile(file, expectedType);
  const category = CATEGORY_BY_TYPE[validated.mediaType];
  const filename = createFilename(validated);
  const directory = assertInsideRoot(path.resolve(getHeroUploadRoot(), category));
  const destination = resolveFilePath(category, filename);

  await mkdir(directory, { recursive: true, mode: 0o755 });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()), {
    flag: "wx",
    mode: 0o644,
  });

  return {
    url: `${HERO_UPLOAD_URL_PREFIX}/${category}/${filename}`,
    type: validated.mediaType,
    filename,
    mimeType: file.type,
    size: file.size,
  };
};

export const parseHeroMediaUrl = (value: string) => {
  let pathname: string;
  try {
    pathname = value.startsWith("http://") || value.startsWith("https://")
      ? new URL(value).pathname
      : new URL(value, "https://darlamamy.local").pathname;
  } catch {
    throw new HeroStorageError("URL de média Hero invalide.", 400);
  }

  const match = pathname.match(
    /^\/uploads\/hero\/(images|videos)\/(hero-\d{13}-[a-f0-9]{16}\.(?:jpe?g|png|webp|mp4|webm))$/,
  );
  if (!match) {
    throw new HeroStorageError("Ce fichier n’appartient pas au stockage local du Hero.", 400);
  }

  const category = match[1] as "images" | "videos";
  const filename = match[2];
  return {
    category,
    filename,
    path: resolveFilePath(category, filename),
  };
};

export const deleteHeroMedia = async (url: string) => {
  const media = parseHeroMediaUrl(url);
  try {
    await stat(media.path);
    await unlink(media.path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new HeroStorageError("Fichier Hero introuvable.", 404);
    }
    throw error;
  }
};

export const getHeroMediaFile = async (category: string, filename: string) => {
  if (category !== "images" && category !== "videos") {
    throw new HeroStorageError("Catégorie Hero invalide.", 404);
  }
  const filePath = resolveFilePath(category, filename);
  const fileStat = await stat(filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") throw new HeroStorageError("Fichier Hero introuvable.", 404);
    throw error;
  });
  if (!fileStat.isFile()) throw new HeroStorageError("Fichier Hero introuvable.", 404);

  const extension = path.extname(filename).slice(1).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!mimeType) throw new HeroStorageError("Type de média Hero invalide.", 415);

  return { filePath, size: fileStat.size, mimeType };
};

export const isLocalHeroMediaUrl = (value: string | null | undefined) => {
  if (!value) return false;
  try {
    parseHeroMediaUrl(value);
    return true;
  } catch {
    return false;
  }
};
