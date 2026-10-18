import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { createSyncRepository } from "../../../src/lib/channel-manager/sync/repository.ts";
import { syncMapping } from "../../../src/lib/channel-manager/sync/service.ts";
import type { ParsedCalendarEvent } from "../../../src/lib/channel-manager/ical/parser.ts";

const live = process.env.VALIDATE_SUPABASE_SYNC === "1";

test("imports idempotently, blocks direct inventory, cancels safely, and records conflicts", { skip: !live }, async () => {
  const url = process.env.LOCAL_SUPABASE_URL ?? "";
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(url).hostname));
  const client = createClient(url, process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY ?? "");
  const { data: room, error: roomError } = await client.from("rooms").select("id").eq("status", "available").limit(1).single();
  assert.ifError(roomError);
  const marker = `sync-${Date.now()}`;
  const { data: channel, error: channelError } = await client
    .from("booking_channels")
    .insert({ name: marker, provider: "custom", connection_type: "import", enabled: true, import_url_encrypted: "test" })
    .select("id")
    .single();
  assert.ifError(channelError);
  const { data: mapping, error: mappingError } = await client
    .from("channel_room_mappings")
    .insert({ channel_id: channel.id, room_id: room.id, enabled: true })
    .select("id")
    .single();
  assert.ifError(mappingError);

  const repository = createSyncRepository(client);
  let events: ParsedCalendarEvent[] = [
    { uid: `${marker}-uid`, checkIn: "2037-01-10", checkOut: "2037-01-12", status: "active", sequence: 0, revision: "r1", summary: null, source: "custom" },
  ];
  const dependencies = {
    ...repository,
    decryptUrl: () => "https://calendar.example.test/feed.ics",
    fetchCalendar: async () => ({ body: "fixture", finalUrl: "https://calendar.example.test/feed.ics" }),
    parseCalendar: () => events,
  };

  try {
    const first = await syncMapping(mapping.id, "manual", dependencies);
    assert.equal(first.created, 1);
    const second = await syncMapping(mapping.id, "manual", dependencies);
    assert.equal(second.created, 0);
    const { count } = await client
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("channel_mapping_id", mapping.id)
      .eq("external_uid", `${marker}-uid`);
    assert.equal(count, 1);

    const blocked = await client.rpc("create_reservation_authoritatively", {
      p_reference: `BLK-${Date.now().toString(36)}`, p_guest_name: "Local Test", p_guest_email: `${marker}@example.test`, p_guest_phone: null,
      p_guest_count: 1, p_room_id: room.id, p_check_in: "2037-01-10", p_check_out: "2037-01-11", p_total_amount: 100,
      p_paid_amount: 0, p_status: "pending", p_special_requests: null, p_admin_notes: null, p_source: "direct",
    });
    assert.match(blocked.error?.message ?? "", /availability_conflict/);

    events = [{ ...events[0], status: "cancelled", revision: "r2" }];
    const cancelled = await syncMapping(mapping.id, "manual", dependencies);
    assert.equal(cancelled.cancelled, 1);
    const released = await client.rpc("create_reservation_authoritatively", {
      p_reference: `REL-${Date.now().toString(36)}`, p_guest_name: "Local Test", p_guest_email: `${marker}@example.test`, p_guest_phone: null,
      p_guest_count: 1, p_room_id: room.id, p_check_in: "2037-01-10", p_check_out: "2037-01-11", p_total_amount: 100,
      p_paid_amount: 0, p_status: "confirmed", p_special_requests: null, p_admin_notes: null, p_source: "direct",
    });
    assert.ifError(released.error);

    events = [{ uid: `${marker}-conflict`, checkIn: "2037-01-10", checkOut: "2037-01-11", status: "active", sequence: 0, revision: "c1", summary: null, source: "custom" }];
    const conflict = await syncMapping(mapping.id, "manual", dependencies);
    assert.equal(conflict.conflicts, 1);
    const { count: conflictCount } = await client.from("reservation_conflicts").select("id", { count: "exact", head: true }).eq("mapping_id", mapping.id).eq("status", "open");
    assert.equal(conflictCount, 1);
  } finally {
    await client.from("reservation_conflicts").delete().eq("mapping_id", mapping.id);
    await client.from("reservations").delete().eq("channel_mapping_id", mapping.id);
    await client.from("reservations").delete().eq("guest_email", `${marker}@example.test`);
    await client.from("channel_sync_runs").delete().eq("mapping_id", mapping.id);
    await client.from("channel_room_mappings").delete().eq("id", mapping.id);
    await client.from("booking_channels").delete().eq("id", channel.id);
  }
});
