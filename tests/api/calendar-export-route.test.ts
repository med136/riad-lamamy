import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("calendar export route authenticates opaque tokens and exports only availability fields", async () => {
  const source = await readFile(new URL("../../src/app/api/calendar/[token]/route.ts", import.meta.url), "utf8");
  assert.match(source, /sha256/);
  assert.match(source, /export_token_hash/);
  assert.match(source, /\.eq\("enabled", true\)/);
  assert.match(source, /\.select\("id, check_in, check_out, status"\)/);
  assert.match(source, /private, no-store/);
  for (const privateField of ["guest_name", "guest_email", "guest_phone", "special_requests", "admin_notes"]) {
    assert.equal(source.includes(privateField), false, privateField);
  }
});

test("scheduler endpoint is fail-closed behind a bearer secret", async () => {
  const source = await readFile(new URL("../../src/app/api/internal/channel-sync/route.ts", import.meta.url), "utf8");
  assert.match(source, /CHANNEL_SCHEDULER_SECRET/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /status: 503/);
  assert.match(source, /status: 401/);
});
