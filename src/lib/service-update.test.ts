import assert from "node:assert/strict";
import test from "node:test";

import { buildServiceUpdate } from "./service-update.ts";

test("construit une mise à jour complète d'un service", () => {
  assert.deepEqual(
    buildServiceUpdate({
      name: "Transfert privé",
      category: "transport",
      display_order: 4,
      price: 250,
      duration_minutes: 45,
      is_active: true,
      description: "Depuis ou vers l'aéroport.",
    }),
    {
      name: "Transfert privé",
      category: "transport",
      display_order: 4,
      base_price: 250,
      duration_minutes: 45,
      is_active: true,
      description: "Depuis ou vers l'aéroport.",
    },
  );
});

test("normalise le nom et rejette les valeurs invalides", () => {
  assert.deepEqual(buildServiceUpdate({ name: "  Hammam  " }), { name: "Hammam" });
  assert.throws(() => buildServiceUpdate({ name: "   " }), /nom/i);
  assert.throws(() => buildServiceUpdate({ category: "inconnue" }), /catégorie/i);
  assert.throws(() => buildServiceUpdate({ display_order: -1 }), /ordre/i);
});

test("rejette une mise à jour vide", () => {
  assert.throws(() => buildServiceUpdate({}), /aucun champ/i);
});
