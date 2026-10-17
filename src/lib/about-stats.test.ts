import assert from "node:assert/strict";
import test from "node:test";

import { ABOUT_STAT_DEFINITIONS, ABOUT_STAT_KEYS, getAboutStats } from "./about-stats.ts";
import { allMessageKeys, baseMessages, translate, type Language, type MessageKey } from "./i18n.ts";

test("all four home-page figures have distinct CMS translation keys", () => {
  assert.deepEqual(ABOUT_STAT_DEFINITIONS.map(({ id }) => id), [
    "experience", "rooms", "guests", "satisfaction",
  ]);
  const keys = ABOUT_STAT_DEFINITIONS.flatMap(({ valueKey, labelKey }) => [valueKey, labelKey]);
  assert.equal(new Set(keys).size, 8);
  assert.equal(ABOUT_STAT_KEYS.size, 8);
  for (const key of keys) assert.ok(allMessageKeys.includes(key));
});

test("default French values match the existing site figures", () => {
  assert.deepEqual(getAboutStats((key) => translate("fr", key)), [
    { id: "experience", value: "15 ans", label: "d’expérience" },
    { id: "rooms", value: "12", label: "chambres uniques" },
    { id: "guests", value: "5 000+", label: "voyageurs accueillis" },
    { id: "satisfaction", value: "98 %", label: "de satisfaction" },
  ]);
});

test("English values and labels exist for every figure", () => {
  const translated = getAboutStats((key) => translate("en", key));
  assert.equal(translated.length, 4);
  for (const entry of translated) {
    assert.ok(entry.value.trim());
    assert.ok(entry.label.trim());
  }
});

test("CMS-provided overrides update the public figures without changing other translations", () => {
  const language: Language = "fr";
  const overrides: Partial<Record<MessageKey, string>> = {
    "home.about.stats_experience_value": "20 ans",
    "home.about.stats_experience_label": "d’histoire familiale",
  };
  const t = (key: MessageKey) => overrides[key] ?? baseMessages[language][key];
  const results = getAboutStats(t);
  assert.equal(results[0].value, "20 ans");
  assert.equal(results[0].label, "d’histoire familiale");
  assert.equal(results[1].value, "12");
});
