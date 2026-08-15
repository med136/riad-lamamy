import assert from "node:assert/strict";
import test from "node:test";
import { File } from "node:buffer";
import {
  HERO_VIDEO_MAX_BYTES,
  validateHeroFile,
} from "./hero-media.ts";

const file = (name: string, type: string, bytes: number[]) =>
  new File([Uint8Array.from(bytes)], name, { type }) as unknown as globalThis.File;

test("accepte les signatures JPEG et WebP autorisées", async () => {
  await assert.doesNotReject(() =>
    validateHeroFile(file("hero.jpg", "image/jpeg", [0xff, 0xd8, 0xff, 0xe0])),
  );
  await assert.doesNotReject(() =>
    validateHeroFile(
      file("hero.webp", "image/webp", [
        0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
      ]),
    ),
  );
});

test("accepte les signatures MP4 et WebM autorisées", async () => {
  await assert.doesNotReject(() =>
    validateHeroFile(file("hero.mp4", "video/mp4", [0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70])),
  );
  await assert.doesNotReject(() =>
    validateHeroFile(file("hero.webm", "video/webm", [0x1a, 0x45, 0xdf, 0xa3])),
  );
});

test("rejette les formats, extensions et signatures incohérents", async () => {
  await assert.rejects(() => validateHeroFile(file("hero.svg", "image/svg+xml", [60, 115, 118, 103])));
  await assert.rejects(() => validateHeroFile(file("hero.png", "image/jpeg", [0xff, 0xd8, 0xff])));
  await assert.rejects(() => validateHeroFile(file("hero.mp4", "video/mp4", [0, 1, 2, 3, 4, 5, 6, 7])));
});

test("rejette une vidéo dépassant 50 Mo avant lecture du contenu", async () => {
  const oversized = {
    name: "hero.mp4",
    type: "video/mp4",
    size: HERO_VIDEO_MAX_BYTES + 1,
    slice: () => {
      throw new Error("slice ne doit pas être appelé");
    },
  } as unknown as globalThis.File;
  await assert.rejects(() => validateHeroFile(oversized), /50 Mo/);
});
