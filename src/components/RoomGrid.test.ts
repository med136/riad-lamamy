import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RoomGrid } from "./RoomGrid.ts";

test("affiche une colonne sur mobile, deux sur tablette et quatre sur ordinateur", () => {
  const cards = [1, 2, 3, 4].map((id) => createElement("article", { key: id }, `Chambre ${id}`));
  const html = renderToStaticMarkup(createElement(RoomGrid, null, cards));

  assert.match(html, /grid-cols-1/);
  assert.match(html, /sm:grid-cols-2/);
  assert.match(html, /lg:grid-cols-4/);
  assert.equal((html.match(/<article/g) ?? []).length, 4);
});
