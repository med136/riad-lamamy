import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERIENCE_ICON_CATEGORIES,
  EXPERIENCE_ICON_OPTIONS,
  getExperienceIconOption,
} from "./experience-icons.ts";

const originalCodes = [
  "sunrise", "compass", "coffee", "moon",
  "star", "heart", "map-pin", "sparkles",
];

test("propose un large catalogue organisé sans codes dupliqués", () => {
  const codes: string[] = EXPERIENCE_ICON_OPTIONS.map(({ code }) => code);
  const categories = new Set(EXPERIENCE_ICON_CATEGORIES.map(({ id }) => id));

  assert.ok(codes.length >= 70);
  assert.equal(new Set(codes).size, codes.length);
  for (const code of originalCodes) assert.ok(codes.includes(code));
  for (const option of EXPERIENCE_ICON_OPTIONS) {
    assert.ok(categories.has(option.category));
    assert.ok(option.label.trim());
    assert.ok(option.icon);
  }
});

test("retrouve les nouvelles icônes et normalise les codes", () => {
  assert.equal(getExperienceIconOption("  CHEF-HAT  ").code, "chef-hat");
  assert.equal(getExperienceIconOption("shower-head").code, "shower-head");
  assert.equal(getExperienceIconOption("  STAR ").code, "star");
});

test("utilise une icône sûre pour un code vide ou inconnu", () => {
  assert.equal(getExperienceIconOption("").code, "sparkles");
  assert.equal(getExperienceIconOption("inconnue").code, "sparkles");
  assert.equal(getExperienceIconOption(undefined, "sunrise").code, "sunrise");
});
