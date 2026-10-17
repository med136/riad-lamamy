import assert from "node:assert/strict";
import test from "node:test";
import { toChannelAdminDto, toMappingAdminDto } from "./dto.ts";

test("channel DTO reports secret presence without serializing ciphertext", () => {
  const dto = toChannelAdminDto({
    id: "8a1e94d6-a128-46bb-a772-7b509a11c201",
    name: "Airbnb",
    provider: "airbnb",
    connection_type: "bidirectional",
    enabled: false,
    import_url_encrypted: "v1.secret-ciphertext",
    import_url_host: "calendar.airbnb.com",
    sync_interval_minutes: 60,
    health: "not_configured",
    last_synced_at: null,
    created_at: "2026-10-17T00:00:00Z",
    updated_at: "2026-10-17T00:00:00Z",
  });

  assert.equal(dto.hasImportUrl, true);
  assert.equal(dto.importHost, "calendar.airbnb.com");
  assert.equal(JSON.stringify(dto).includes("secret-ciphertext"), false);
  assert.equal("import_url_encrypted" in dto, false);
});

test("mapping DTO exposes token hint and presence, never token hash", () => {
  const dto = toMappingAdminDto({
    id: "4ce4e43c-a8f7-4bba-870e-20fa41b4ff23",
    channel_id: "8a1e94d6-a128-46bb-a772-7b509a11c201",
    room_id: 4,
    enabled: false,
    external_room_id: null,
    export_token_hash: "sha256-secret",
    export_token_hint: "…A91F",
    stale_observation_count: 0,
    last_synced_at: null,
    created_at: "2026-10-17T00:00:00Z",
    updated_at: "2026-10-17T00:00:00Z",
  });

  assert.equal(dto.hasExportToken, true);
  assert.equal(dto.exportTokenHint, "…A91F");
  assert.equal(JSON.stringify(dto).includes("sha256-secret"), false);
  assert.equal("export_token_hash" in dto, false);
});
