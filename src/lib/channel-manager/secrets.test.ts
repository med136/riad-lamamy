import assert from "node:assert/strict";
import test from "node:test";
import { decryptChannelSecret, encryptChannelSecret } from "./secrets.ts";

const key = Buffer.alloc(32, 7).toString("base64");

test("channel secret encryption roundtrips with a versioned randomized envelope", () => {
  const first = encryptChannelSecret("https://calendar.example/feed.ics", key);
  const second = encryptChannelSecret("https://calendar.example/feed.ics", key);
  assert.match(first, /^v1\./);
  assert.notEqual(first, second);
  assert.equal(decryptChannelSecret(first, key), "https://calendar.example/feed.ics");
});

test("tampered payloads and wrong keys are rejected", () => {
  const encrypted = encryptChannelSecret("secret", key);
  assert.throws(() => decryptChannelSecret(`${encrypted.slice(0, -2)}aa`, key));
  assert.throws(() => decryptChannelSecret(encrypted, Buffer.alloc(32, 9).toString("base64")));
  assert.throws(() => encryptChannelSecret("secret", "too-short"));
});
