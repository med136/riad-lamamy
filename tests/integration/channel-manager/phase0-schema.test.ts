import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

const migrationDirectory = path.join(process.cwd(), "supabase", "migrations");
const migrationName = readdirSync(migrationDirectory).find((name) =>
  name.endsWith("_channel_manager_phase0.sql"),
);

assert.ok(migrationName, "Phase 0 migration must exist");

const sql = readFileSync(
  path.join(migrationDirectory, migrationName),
  "utf8",
);

test("baseline migration creates booking_seq before referencing it", () => {
  const baselineSql = readFileSync(
    path.join(migrationDirectory, "20240101000000_riad_complete_schema.sql"),
    "utf8",
  );
  const sequencePosition = baselineSql.search(
    /create sequence if not exists public\.booking_seq/i,
  );
  const referencePosition = baselineSql.search(/nextval\s*\(\s*'booking_seq'/i);

  assert.ok(sequencePosition >= 0, "booking sequence must be created");
  assert.ok(
    sequencePosition < referencePosition,
    "booking sequence must exist before the bookings default references it",
  );
});

test("baseline available_rooms view exposes one computed availability column", () => {
  const baselineSql = readFileSync(
    path.join(migrationDirectory, "20240101000000_riad_complete_schema.sql"),
    "utf8",
  );
  const viewSql = baselineSql.slice(
    baselineSql.search(/create or replace view public\.available_rooms/i),
  );

  assert.doesNotMatch(viewSql, /select\s+r\.\*/i);
  assert.match(viewSql, /coalesce\s*\(\s*a\.is_available\s*,\s*true\s*\)\s+as\s+is_available/i);
});

test("legacy migrations do not nest anonymous DO blocks", () => {
  const legacySql = readFileSync(
    path.join(migrationDirectory, "20260107192006_riad_complete_schema.sql"),
    "utf8",
  );

  assert.doesNotMatch(legacySql, /do\s+\$\$\s+begin\s+do\s+\$\$/i);
  assert.doesNotMatch(
    legacySql,
    /create index if not exists idx_reviews_overall_rating[\s\S]*?on public\.reviews\(overall_rating desc\);(?![\s\S]*?end if)/i,
  );
  assert.match(legacySql, /check_room_availability\s*\(\s*p_room_id\s+uuid/i);
  assert.match(legacySql, /calculate_booking_price\s*\(\s*p_room_id\s+uuid/i);
  assert.match(legacySql, /and check_in < p_check_out[\s\S]*and check_out > p_check_in/i);
  assert.match(legacySql, /select base_price into v_base_price/i);
});

test("admin reservations use the canonical UUID room identifier", () => {
  const adminSql = readFileSync(
    path.join(migrationDirectory, "20260111144345_admin_panel.sql"),
    "utf8",
  );

  assert.match(adminSql, /room_id\s+uuid\s+references\s+rooms\(id\)/i);
  assert.match(
    adminSql,
    /if exists[\s\S]*columns[\s\S]*column_name='status'[\s\S]*idx_rooms_status/i,
  );

  const duplicateSql = readFileSync(
    path.join(migrationDirectory, "20260111150143_admin_panel.sql"),
    "utf8",
  );
  assert.doesNotMatch(duplicateSql, /create\s+(table|policy|type)/i);
});

test("room normalization backfills price only from columns that exist", () => {
  const roomFixSql = readFileSync(
    path.join(migrationDirectory, "20260116000000_fix_rooms_schema.sql"),
    "utf8",
  );

  assert.match(roomFixSql, /column_name = 'base_price_per_night'[\s\S]*execute/i);
  assert.match(roomFixSql, /column_name = 'price'[\s\S]*set base_price = price/i);
  assert.match(roomFixSql, /add column if not exists status/i);
});

test("gallery relations use the canonical identifiers", () => {
  const gallerySql = readFileSync(
    path.join(migrationDirectory, "20260119_update_gallery_relations.sql"),
    "utf8",
  );

  assert.match(gallerySql, /room_id\s+uuid\s+references public\.rooms\(id\)/i);
  assert.match(gallerySql, /service_id\s+bigint\s+references public\.services\(id\)/i);
});

test("local seed uses the canonical gallery featured column", () => {
  const seedSql = readFileSync(
    path.join(process.cwd(), "supabase", "seed.sql"),
    "utf8",
  );

  assert.match(seedSql, /insert into gallery[\s\S]*is_featured/i);
  assert.doesNotMatch(seedSql, /insert into gallery\s*\([^)]*\bfeatured\b/i);
});

test("Phase 0 migration normalizes canonical inventory fields without deleting data", () => {
  assert.match(sql, /add column if not exists base_price/i);
  assert.match(sql, /add column if not exists seasonal_prices/i);
  assert.match(sql, /add column if not exists max_guests/i);
  assert.match(sql, /coalesce\s*\(\s*base_price\s*,\s*price/i);
  assert.match(sql, /'blocked'/i);
  assert.doesNotMatch(sql, /delete\s+from\s+(public\.)?(rooms|reservations)/i);
});

test("Phase 0 migration provides a zero-overlap preflight before enabling the constraint", () => {
  const preflightPosition = sql.search(/reservation_overlap_preflight/i);
  const constraintPosition = sql.search(/exclude\s+using\s+gist/i);

  assert.ok(preflightPosition >= 0, "preflight function is required");
  assert.ok(constraintPosition > preflightPosition, "preflight must precede constraint");
  assert.match(sql, /daterange\s*\(\s*check_in\s*,\s*check_out\s*,\s*'\[\)'/i);
  assert.match(sql, /pending[\s\S]*confirmed[\s\S]*blocked/i);
});

test("Phase 0 migration exposes one authoritative reservation RPC", () => {
  assert.match(sql, /create or replace function public\.create_reservation_authoritatively/i);
  assert.match(sql, /p_room_id\s+uuid/i);
  assert.match(sql, /raise exception[\s\S]*availability_conflict/i);
  assert.match(sql, /grant execute[\s\S]*service_role/i);
  assert.match(sql, /revoke all[\s\S]*from public/i);
});

const liveValidationEnabled = process.env.VALIDATE_SUPABASE_PHASE0 === "1";

test(
  "authoritative RPC permits same-day turnover and rejects a concurrent overlap",
  { skip: !liveValidationEnabled },
  async () => {
    const url = process.env.LOCAL_SUPABASE_URL ?? "";
    const serviceKey = process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY ?? "";
    const hostname = new URL(url).hostname;
    assert.ok(
      hostname === "127.0.0.1" || hostname === "localhost",
      "live Phase 0 validation is restricted to local Supabase",
    );
    assert.ok(serviceKey, "local service-role key is required");

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: rooms, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("status", "available")
      .limit(1);
    assert.ifError(roomError);
    assert.ok(rooms?.[0]?.id, "local seed must contain an available room");

    const roomId = rooms[0].id;
    const marker = `channel-phase0-${Date.now()}@example.test`;
    const makePayload = (reference: string, checkIn: string, checkOut: string) => ({
      p_reference: reference,
      p_guest_name: "Channel Phase 0 Test",
      p_guest_email: marker,
      p_guest_phone: null,
      p_guest_count: 1,
      p_room_id: roomId,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_total_amount: 100,
      p_paid_amount: 0,
      p_status: "pending",
      p_special_requests: null,
      p_admin_notes: "local disposable integration test",
      p_source: "direct",
    });

    try {
      const [first, second] = await Promise.all([
        supabase.rpc(
          "create_reservation_authoritatively",
          makePayload(`PH0-${Date.now()}-A`, "2035-02-10", "2035-02-12"),
        ),
        supabase.rpc(
          "create_reservation_authoritatively",
          makePayload(`PH0-${Date.now()}-B`, "2035-02-10", "2035-02-12"),
        ),
      ]);

      const outcomes = [first, second];
      assert.equal(outcomes.filter((result) => !result.error).length, 1);
      const conflict = outcomes.find((result) => result.error)?.error;
      assert.match(conflict?.message ?? "", /availability_conflict/);

      const turnover = await supabase.rpc(
        "create_reservation_authoritatively",
        makePayload(`PH0-${Date.now()}-C`, "2035-02-12", "2035-02-13"),
      );
      assert.ifError(turnover.error);
    } finally {
      await supabase.from("reservations").delete().eq("guest_email", marker);
    }
  },
);
