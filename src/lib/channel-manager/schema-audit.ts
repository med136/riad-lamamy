export const CANONICAL_ROOM_COLUMNS = [
  "base_price",
  "max_guests",
  "seasonal_prices",
  "status",
] as const;

export const CHANNEL_RESERVATION_COLUMNS = [
  "source",
  "channel_id",
  "channel_mapping_id",
  "external_uid",
  "external_revision",
  "external_status",
  "imported_at",
  "last_seen_at",
  "raw_external_data",
] as const;

export type ActiveOverlap = {
  roomId: string;
  firstReservationId: string;
  secondReservationId: string;
};

export type SchemaAuditInput = {
  roomColumns: readonly string[];
  reservationColumns: readonly string[];
  reservationStatusValues: readonly string[];
  activeOverlaps: readonly ActiveOverlap[];
};

export type SchemaAuditSummary = {
  missingRoomColumns: string[];
  missingReservationColumns: string[];
  missingInventoryStatuses: string[];
  activeOverlapCount: number;
  activeOverlaps: ActiveOverlap[];
  safeToEnableOverlapConstraint: boolean;
};

const missingFrom = (
  required: readonly string[],
  actual: readonly string[],
): string[] => {
  const available = new Set(actual);
  return required.filter((column) => !available.has(column));
};

export function summarizeSchemaAudit(
  input: SchemaAuditInput,
): SchemaAuditSummary {
  const missingRoomColumns = missingFrom(
    CANONICAL_ROOM_COLUMNS,
    input.roomColumns,
  );
  const missingReservationColumns = missingFrom(
    CHANNEL_RESERVATION_COLUMNS,
    input.reservationColumns,
  );
  const missingInventoryStatuses = missingFrom(
    ["pending", "confirmed", "blocked"],
    input.reservationStatusValues,
  );
  const activeOverlaps = [...input.activeOverlaps];

  return {
    missingRoomColumns,
    missingReservationColumns,
    missingInventoryStatuses,
    activeOverlapCount: activeOverlaps.length,
    activeOverlaps,
    safeToEnableOverlapConstraint:
      missingRoomColumns.length === 0 &&
      missingInventoryStatuses.length === 0 &&
      activeOverlaps.length === 0,
  };
}
