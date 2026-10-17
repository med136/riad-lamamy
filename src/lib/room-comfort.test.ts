import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_ROOM_COMFORT_FEATURES,
  MAX_ROOM_COMFORT_FEATURES,
  ROOM_COMFORT_FEATURES_SETTING_KEY,
  parseRoomComfortFeatures,
  validateRoomComfortFeatures,
} from "./room-comfort.ts";
import { EXPERIENCE_ICON_OPTIONS } from "./experience-icons.ts";

test("préserve les six équipements d’origine et leurs textes français", () => {
  const items = DEFAULT_ROOM_COMFORT_FEATURES;
  assert.deepEqual(items.map((item) => item.fr.title), [
    "Confort thermique",
    "Connexion Wi-Fi",
    "Tranquillité",
    "Salle de bain",
    "Hospitalité",
    "Séjour personnalisé",
  ]);
  assert.deepEqual(items.map((item) => item.icon), [
    "thermometer-sun", "wifi", "lock", "droplets", "coffee", "heart",
  ]);
  assert.ok(items.every((item) => item.fr.description.trim() && item.en.title.trim() && item.en.description.trim()));
  assert.equal(ROOM_COMFORT_FEATURES_SETTING_KEY, "comfortFeatures");
});

test("accepte les ajouts, l’ordre personnalisé et les traductions", () => {
  const one = DEFAULT_ROOM_COMFORT_FEATURES[0];
  const extra = {
    ...one,
    id: "feature_extra",
    icon: "bed-double" as const,
    fr: { title: "Literie", description: "Un sommeil reposant." },
    en: { title: "Bedding", description: "A restful night." },
  };
  assert.deepEqual(parseRoomComfortFeatures([extra, one]), [extra, one]);
  assert.equal(validateRoomComfortFeatures([extra, one]), null);
  assert.ok(EXPERIENCE_ICON_OPTIONS.some(({ code }) => code === extra.icon));
});

test("la configuration absente utilise le fallback; [] supprime toutes les cartes", () => {
  assert.equal(parseRoomComfortFeatures(undefined), null);
  assert.deepEqual(parseRoomComfortFeatures([]), []);
  assert.equal(validateRoomComfortFeatures([]), null);
});

test("rejette les codes d’icônes inconnus, doublons, identifiants dangereux", () => {
  const a = DEFAULT_ROOM_COMFORT_FEATURES[0];
  assert.equal(parseRoomComfortFeatures([a, a]), null);
  assert.equal(parseRoomComfortFeatures([{ ...a, icon: "undefined" }]), null);
  assert.equal(parseRoomComfortFeatures([{ ...a, id: "../../admin" }]), null);
  assert.equal(parseRoomComfortFeatures([{ ...a, fr: { title: 5, description: "" } }]), null);
});

test("exige des titres dans les deux langues et limite la taille", () => {
  const a = DEFAULT_ROOM_COMFORT_FEATURES[0];
  assert.match(validateRoomComfortFeatures([{ ...a, en: { ...a.en, title: "" } }]) ?? "", /titre/);
  assert.match(validateRoomComfortFeatures([{ ...a, fr: { ...a.fr, title: " " } }]) ?? "", /titre/);
  assert.equal(parseRoomComfortFeatures([{ ...a, fr: { ...a.fr, description: "a".repeat(2001) } }]), null);
  assert.equal(parseRoomComfortFeatures(
    Array.from({ length: MAX_ROOM_COMFORT_FEATURES + 1 }, (_, i) => ({ ...a, id: `feature_${i}` })),
  ), null);
});
