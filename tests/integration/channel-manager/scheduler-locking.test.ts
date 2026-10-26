import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const live = process.env.VALIDATE_SUPABASE_SCHEDULER === "1";

test("claims one scheduler lease at a time and only its owner can release it", { skip: !live }, async () => {
  const url = process.env.LOCAL_SUPABASE_URL ?? "";
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(url).hostname));
  const client = createClient(url, process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY ?? "");
  const { data: room, error: roomError } = await client.from("rooms").select("id").limit(1).single();
  assert.ifError(roomError);
  const { data: channel, error: channelError } = await client
    .from("booking_channels")
    .insert({ name: `scheduler-${Date.now()}`, provider: "custom", connection_type: "import", enabled: true })
    .select("id")
    .single();
  assert.ifError(channelError);
  const { data: mapping, error: mappingError } = await client
    .from("channel_room_mappings")
    .insert({ channel_id: channel.id, room_id: room.id, enabled: true })
    .select("id")
    .single();
  assert.ifError(mappingError);

  const first = randomUUID();
  const second = randomUUID();
  try {
    const [claimA, claimB] = await Promise.all([
      client.rpc("claim_channel_sync_lock", { p_mapping_id: mapping.id, p_lock_token: first, p_ttl_seconds: 60 }),
      client.rpc("claim_channel_sync_lock", { p_mapping_id: mapping.id, p_lock_token: second, p_ttl_seconds: 60 }),
    ]);
    assert.ifError(claimA.error);
    assert.ifError(claimB.error);
    assert.equal([claimA.data, claimB.data].filter(Boolean).length, 1);
    const owner = claimA.data ? first : second;
    const nonOwner = claimA.data ? second : first;
    const wrongRelease = await client.rpc("release_channel_sync_lock", { p_mapping_id: mapping.id, p_lock_token: nonOwner });
    assert.ifError(wrongRelease.error);
    assert.equal(wrongRelease.data, false);
    const ownerRelease = await client.rpc("release_channel_sync_lock", { p_mapping_id: mapping.id, p_lock_token: owner });
    assert.ifError(ownerRelease.error);
    assert.equal(ownerRelease.data, true);

    await client.from("channel_room_mappings").update({ enabled: false }).eq("id", mapping.id);
    const disabledClaim = await client.rpc("claim_channel_sync_lock", { p_mapping_id: mapping.id, p_lock_token: randomUUID(), p_ttl_seconds: 60 });
    assert.ifError(disabledClaim.error);
    assert.equal(disabledClaim.data, false);
  } finally {
    await client.from("channel_room_mappings").delete().eq("id", mapping.id);
    await client.from("booking_channels").delete().eq("id", channel.id);
  }
});
