import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERIENCE_ICON_OPTIONS,
  getExperienceIconOption,
} from "./experience-icons.ts";

test("expose exactement les codes d’icônes documentés", () => {
  assert.deepEqual(
    EXPERIENCE_ICON_OPTIONS.map(({ code }) => code),
    [
      "sunrise",
      "compass",
      "coffee",
      "moon",
      "star",
      "heart",
      "map-pin",
      "sparkles",
    ],
  );
});

test("normalise les espaces et les majuscules d’un code valide", () => {
  assert.equal(getExperienceIconOption("  STAR ").code, "star");
});

test("utilise une icône sûre pour un code vide ou inconnu", () => {
  assert.equal(getExperienceIconOption("").code, "sparkles");
  assert.equal(getExperienceIconOption("inconnue").code, "sparkles");
  assert.equal(getExperienceIconOption(undefined, "sunrise").code, "sunrise");
});

