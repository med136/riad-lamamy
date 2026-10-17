import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ExternalReviewLinks } from "./ExternalReviewLinks.ts";

test("rend les quatre plateformes comme des liens externes sécurisés", () => {
  const html = renderToStaticMarkup(createElement(ExternalReviewLinks));

  const expectedLinks = [
    ["Booking.com", "https://www.booking.com/"],
    ["Google", "https://www.google.com/"],
    ["TripAdvisor", "https://www.tripadvisor.fr/"],
    ["Airbnb", "https://www.airbnb.fr/"],
  ];

  for (const [label, href] of expectedLinks) {
    assert.match(html, new RegExp(`href="${href}"[^>]*>${label}</a>`));
  }

  assert.equal((html.match(/target="_blank"/g) ?? []).length, 4);
  assert.equal((html.match(/rel="noopener noreferrer"/g) ?? []).length, 4);
});
