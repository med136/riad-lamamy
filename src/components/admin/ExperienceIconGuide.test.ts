import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ExperienceIconGuide } from "./ExperienceIconGuide.ts";

test("affiche une grille avec chaque code d’icône accepté", () => {
  const html = renderToStaticMarkup(createElement(ExperienceIconGuide));
  const expectedCodes = [
    "sunrise",
    "compass",
    "coffee",
    "moon",
    "star",
    "heart",
    "map-pin",
    "sparkles",
  ];

  assert.match(html, /Guide des icônes/);
  assert.match(html, /Copiez exactement un de ces codes/);

  for (const code of expectedCodes) {
    assert.equal(
      (html.match(new RegExp(`<code[^>]*>${code}</code>`, "g")) ?? []).length,
      1,
    );
  }
});

