import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ExperienceIconGuide } from "./ExperienceIconGuide.ts";
import { EXPERIENCE_ICON_OPTIONS } from "../../lib/experience-icons.ts";

test("affiche toutes les icônes autorisées et leurs catégories", () => {
  const html = renderToStaticMarkup(createElement(ExperienceIconGuide));

  assert.match(html, /Guide des icônes/);
  assert.match(html, /Rechercher une icône/);
  assert.match(html, /Moments &amp; ambiance/);
  assert.match(html, /Découvrir Fès/);
  assert.match(html, /type="search"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Copier le code/);

  for (const { code } of EXPERIENCE_ICON_OPTIONS) {
    assert.equal(
      (html.match(new RegExp(`<code[^>]*>${code}</code>`, "g")) ?? []).length,
      1,
    );
  }
});
