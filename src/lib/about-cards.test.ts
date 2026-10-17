import assert from "node:assert/strict";
import test from "node:test";

import {
  ABOUT_CARDS_SETTINGS_KEY,
  LEGACY_ABOUT_CARDS,
  MAX_ABOUT_CARDS,
  legacyAboutCards,
  parseAboutCards,
  validateAboutCards,
} from "./about-cards.ts";
import { allMessageKeys, baseMessages, type MessageKey } from "./i18n.ts";

const read = (key: string, language: "fr" | "en") =>
  baseMessages[language][key as MessageKey] ?? "";

test("initialises four Valeurs and three Esprit cards from actual FR/EN content", () => {
  const values = legacyAboutCards("values", read);
  const team = legacyAboutCards("team", read);

  assert.deepEqual(values.map(({ id }) => id), ["authenticity", "welcome", "detail", "closeness"]);
  assert.deepEqual(team.map(({ id }) => id), ["attentive", "advice", "tailored"]);
  assert.deepEqual(values.map(({ fr }) => fr.title), ["Authenticité", "Accueil", "Soin du détail", "Proximité"]);
  assert.deepEqual(team.map(({ fr }) => fr.title), [
    "Une présence attentive", "Fès à votre rythme", "Des attentions discrètes",
  ]);
  assert.deepEqual(team.map(({ fr }) => fr.kicker), ["Accueil", "Conseils", "Sur mesure"]);
  assert.deepEqual(values.map(({ icon }) => icon), ["house", "heart", "sparkles", "users"]);
  assert.deepEqual(team.map(({ icon }) => icon), ["heart-handshake", "message-circle", "sparkles"]);
  assert.equal(LEGACY_ABOUT_CARDS.values.length, 4);
  assert.equal(LEGACY_ABOUT_CARDS.team.length, 3);
  for (const item of [...values, ...team]) {
    assert.ok(item.fr.title && item.en.title);
    assert.ok(item.fr.description && item.en.description);
  }
});

test("preserves current translated CMS overrides on first dynamic edit", () => {
  const currentValues = legacyAboutCards("values", (key, language) =>
    key === "about.values.authenticity.title" && language === "fr"
      ? "Un patrimoine vivant"
      : read(key, language),
  );
  assert.equal(currentValues[0].fr.title, "Un patrimoine vivant");
  assert.equal(validateAboutCards(currentValues), null);
});

test("allows additions, removals, empty sections and ordering without mutating defaults", () => {
  const values = legacyAboutCards("values", read);
  const added = { ...values[0], id: "card_new", icon: "flower-2" as const };
  assert.deepEqual(parseAboutCards([added, values[1]]), [added, values[1]]);
  assert.deepEqual(parseAboutCards([]), []);
  assert.equal(parseAboutCards(undefined), null);
  assert.equal(legacyAboutCards("values", read).length, 4);
  assert.equal(ABOUT_CARDS_SETTINGS_KEY, "cards");
});

test("validates bilingual titles and rejects duplicate IDs, unknown icons and invalid data", () => {
  const first = legacyAboutCards("team", read)[0];
  assert.equal(parseAboutCards([first, first]), null);
  assert.equal(parseAboutCards([{ ...first, icon: "javascript:alert(1)" }]), null);
  assert.equal(parseAboutCards([{ ...first, id: "../outside" }]), null);
  assert.equal(parseAboutCards([{ ...first, fr: { ...first.fr, title: 99 } }]), null);
  assert.match(validateAboutCards([{ ...first, en: { ...first.en, title: " " } }]) ?? "", /titre/);
  assert.equal(parseAboutCards([{ ...first, fr: { ...first.fr, description: "x".repeat(2001) } }]), null);
  assert.equal(parseAboutCards(Array.from({ length: MAX_ABOUT_CARDS + 1 }, (_, i) => ({
    ...first, id: `card_${i}`,
  }))), null);
});

test("all existing legacy keys and SEO keys are part of the editable i18n catalogue", () => {
  for (const section of ["values", "team"] as const) {
    for (const { id } of LEGACY_ABOUT_CARDS[section]) {
      for (const field of section === "team" ? ["kicker", "title", "description"] : ["title", "description"]) {
        assert.ok(allMessageKeys.includes(`about.${section}.${id}.${field}` as MessageKey));
      }
    }
  }
  assert.ok(allMessageKeys.includes("about.seo.title"));
  assert.ok(allMessageKeys.includes("about.seo.description"));
  assert.ok(baseMessages.fr["about.seo.title"].includes("Dar LaMamy"));
  assert.ok(baseMessages.en["about.seo.description"].includes("Dar LaMamy"));
});
