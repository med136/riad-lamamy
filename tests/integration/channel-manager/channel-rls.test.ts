import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

const migration = readFileSync(
  path.join(process.cwd(), "supabase", "migrations", "20261017212351_channel_manager_core.sql"),
  "utf8",
);

test("channel tables default disabled and deny browser roles", () => {
  assert.match(migration, /enabled boolean not null default false/gi);
  for (const table of [
    "booking_channels",
    "channel_room_mappings",
    "channel_sync_runs",
    "reservation_conflicts",
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(migration, new RegExp(`revoke all on public\\.${table} from public, anon, authenticated`, "i"));
  }
});

const live = process.env.VALIDATE_SUPABASE_CHANNEL_RLS === "1";

test("anon cannot read channel secrets while service role can manage rows", { skip: !live }, async () => {
  const url = process.env.LOCAL_SUPABASE_URL ?? "";
  const hostname = new URL(url).hostname;
  assert.ok(hostname === "127.0.0.1" || hostname === "localhost");
  const service = createClient(url, process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY ?? "");
  const anon = createClient(url, process.env.LOCAL_SUPABASE_ANON_KEY ?? "");
  const marker = `RLS ${Date.now()}`;

  const { data: created, error: createError } = await service
    .from("booking_channels")
    .insert({ name: marker, provider: "custom", connection_type: "import" })
    .select("id, enabled")
    .single();
  assert.ifError(createError);
  assert.equal(created.enabled, false);

  try {
    const browserRead = await anon.from("booking_channels").select("import_url_encrypted");
    assert.ok(browserRead.error, "anon read must be rejected rather than returning secret rows");
  } finally {
    await service.from("booking_channels").delete().eq("id", created.id);
  }
});
