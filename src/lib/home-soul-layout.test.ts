import assert from "node:assert/strict";
import test from "node:test";

import {
  HOME_SOUL_CTA_CLASS,
  HOME_SOUL_MEDIA_CLASS,
  HOME_SOUL_TEXT_CLASS,
  WHATSAPP_BUTTON_SIZE_CLASS,
  WHATSAPP_POSITION_CLASS,
  getSoulParagraphClass,
} from "./home-soul-layout.ts";

test("compacte la vidéo et le troisième paragraphe uniquement sur mobile", () => {
  assert.match(HOME_SOUL_MEDIA_CLASS, /aspect-\[4\/3\]/);
  assert.match(HOME_SOUL_MEDIA_CLASS, /sm:aspect-\[5\/6\]/);
  assert.equal(getSoulParagraphClass(0), "");
  assert.equal(getSoulParagraphClass(1), "");
  assert.equal(getSoulParagraphClass(2), "hidden sm:block");
});

test("renforce la lisibilité et transforme le CTA en bouton visible", () => {
  assert.match(HOME_SOUL_TEXT_CLASS, /text-\[#514842\]/);
  assert.match(HOME_SOUL_TEXT_CLASS, /pr-12/);
  assert.match(HOME_SOUL_TEXT_CLASS, /sm:pr-0/);
  assert.match(HOME_SOUL_CTA_CLASS, /bg-\[#0F5A46\]/);
  assert.match(HOME_SOUL_CTA_CLASS, /text-white/);
});

test("réduit et rapproche le bouton WhatsApp du bord sur mobile seulement", () => {
  assert.match(WHATSAPP_POSITION_CLASS, /bottom-3/);
  assert.match(WHATSAPP_POSITION_CLASS, /right-3/);
  assert.match(WHATSAPP_POSITION_CLASS, /sm:bottom-6/);
  assert.match(WHATSAPP_BUTTON_SIZE_CLASS, /h-12/);
  assert.match(WHATSAPP_BUTTON_SIZE_CLASS, /sm:h-\[58px\]/);
});

