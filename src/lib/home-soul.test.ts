import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_SOUL_VIDEO_TYPES,
  MAX_SOUL_VIDEO_BYTES,
  SOUL_POSTER_FALLBACK,
  SOUL_VIDEO_FALLBACK,
  getSoulSettings,
  isSafeSoulLink,
  validateSoulSettings,
} from "./home-soul.ts";
import { allMessageKeys, baseMessages, type MessageKey } from "./i18n.ts";

test("default story uses the existing Login video and unchanged poster", () => {
  assert.deepEqual(getSoulSettings(undefined), {
    videoUrl: "/video/darlamamy.mp4",
    posterUrl: "/riad-login-courtyard.png",
    ctaHref: "/chambres",
    showCta: true,
  });
  assert.equal(SOUL_VIDEO_FALLBACK, "/video/darlamamy.mp4");
  assert.equal(SOUL_POSTER_FALLBACK, "/riad-login-courtyard.png");
});

test("FR and EN are available for every story paragraph, title, CTA and video label", () => {
  const keys = [
    "home.soul.kicker",
    "home.soul.title_before",
    "home.soul.title_accent",
    "home.soul.paragraph_1",
    "home.soul.paragraph_2",
    "home.soul.paragraph_3",
    "home.soul.cta",
    "home.soul.video_label",
  ] as const;
  for (const key of keys) {
    assert.ok(allMessageKeys.includes(key));
    assert.ok(baseMessages.fr[key as MessageKey].trim());
    assert.ok(baseMessages.en[key as MessageKey].trim());
  }
  assert.equal(baseMessages.fr["home.soul.title_accent"], "Dar LaMamy");
});

test("the admin can change the media, CTA link and CTA visibility", () => {
  const settings = {
    videoUrl: "/video/new-home-film.webm",
    posterUrl: "/images/new-poster.jpg",
    ctaHref: "/chambres",
    showCta: false,
  };
  assert.equal(validateSoulSettings(settings), null);
  assert.deepEqual(getSoulSettings(settings), settings);
  assert.equal(validateSoulSettings({ videoUrl: "", posterUrl: "" }), null);
  assert.equal(getSoulSettings({ videoUrl: "", posterUrl: "" }).videoUrl, SOUL_VIDEO_FALLBACK);
});

test("URLs must not contain external links, script schemes or traversal", () => {
  for (const url of ["javascript:alert(1)", "//evil.example/x.mp4", "https://evil.example/video.mp4", "/video/../secret.mp4"]) {
    assert.ok(validateSoulSettings({ videoUrl: url }), url);
  }
  for (const href of ["javascript:alert(1)", "//evil.example", "https://evil.example/path", ""]) {
    assert.equal(isSafeSoulLink(href), false);
    assert.ok(validateSoulSettings({ ctaHref: href }));
  }
  assert.equal(isSafeSoulLink("/contact"), true);
  assert.equal(isSafeSoulLink("/chambres"), true);
});

test("accepts approved Supabase object URLs only for the current project and Soul section", () => {
  const initial = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    const video = "https://example.supabase.co/storage/v1/object/public/public/cms/home/soul/abc-123.mp4";
    const poster = "https://example.supabase.co/storage/v1/object/public/room-images/cms/home/soul/abc-123.webp";
    assert.equal(validateSoulSettings({ videoUrl: video, posterUrl: poster }), null);
    assert.ok(validateSoulSettings({
      videoUrl: "https://other.supabase.co/storage/v1/object/public/public/cms/home/soul/abc.mp4",
    }));
    assert.ok(validateSoulSettings({
      videoUrl: "https://example.supabase.co/storage/v1/object/public/public/cms/admin/video.mp4",
    }));
    assert.ok(validateSoulSettings({ posterUrl: video }));
  } finally {
    if (initial === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = initial;
  }
});

test("upload formats, sizes and unsafe settings fail before publishing", () => {
  assert.deepEqual([...ALLOWED_SOUL_VIDEO_TYPES], ["video/mp4", "video/webm"]);
  assert.equal(MAX_SOUL_VIDEO_BYTES, 45 * 1024 * 1024);
  assert.ok(validateSoulSettings({ showCta: "true" }));
  assert.ok(validateSoulSettings({ posterUrl: "data:image/png;base64,xxxx" }));
  assert.ok(validateSoulSettings({ ctaHref: "/".repeat(150) }));
});
