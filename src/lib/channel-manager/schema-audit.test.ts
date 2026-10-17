import assert from "node:assert/strict";
import test from "node:test";

import { summarizeSchemaAudit } from "./schema-audit.ts";

test("reports missing canonical room columns separately from active overlaps", () => {
  const summary = summarizeSchemaAudit({
    roomColumns: ["id", "name", "price", "max_capacity"],
    reservationColumns: [
      "id",
      "room_id",
      "check_in",
      "check_out",
      "status",
    ],
    reservationStatusValues: ["pending", "confirmed", "cancelled"],
    activeOverlaps: [
      {
        roomId: "room-1",
        firstReservationId: "reservation-1",
        secondReservationId: "reservation-2",
      },
    ],
  });

  assert.deepEqual(summary.missingRoomColumns, [
    "base_price",
    "max_guests",
    "seasonal_prices",
    "status",
  ]);
  assert.deepEqual(summary.missingReservationColumns, [
    "source",
    "channel_id",
    "channel_mapping_id",
    "external_uid",
    "external_revision",
    "external_status",
    "imported_at",
    "last_seen_at",
    "raw_external_data",
  ]);
  assert.equal(summary.activeOverlapCount, 1);
  assert.deepEqual(summary.missingInventoryStatuses, ["blocked"]);
  assert.equal(summary.safeToEnableOverlapConstraint, false);
});

test("schema audit output is descriptive and never generates mutations", () => {
  const summary = summarizeSchemaAudit({
    roomColumns: [
      "id",
      "name",
      "base_price",
      "max_guests",
      "seasonal_prices",
      "status",
    ],
    reservationColumns: [
      "id",
      "room_id",
      "check_in",
      "check_out",
      "status",
      "source",
      "channel_id",
      "channel_mapping_id",
      "external_uid",
      "external_revision",
      "external_status",
      "imported_at",
      "last_seen_at",
      "raw_external_data",
    ],
    reservationStatusValues: [
      "pending",
      "confirmed",
      "blocked",
      "cancelled",
      "rejected",
    ],
    activeOverlaps: [],
  });

  const serialized = JSON.stringify(summary);
  assert.equal(summary.safeToEnableOverlapConstraint, true);
  assert.doesNotMatch(serialized, /\b(insert|update|delete|alter|drop)\b/i);
});
