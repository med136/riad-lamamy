import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import process from "node:process";

import { summarizeSchemaAudit } from "../src/lib/channel-manager/schema-audit.ts";

if (existsSync(".env.local") && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env.local");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
  );
}

const openApiResponse = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
  headers: {
    Accept: "application/openapi+json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  },
});

if (!openApiResponse.ok) {
  throw new Error(`Schema discovery failed with HTTP ${openApiResponse.status}`);
}

const openApi = await openApiResponse.json();
const definitions = openApi.definitions ?? openApi.components?.schemas ?? {};
const roomColumns = Object.keys(definitions.rooms?.properties ?? {});
const reservationColumns = Object.keys(
  definitions.reservations?.properties ?? {},
);
const reservationStatusValues =
  definitions.reservations?.properties?.status?.enum ?? [];
const deployedInventoryStatuses = ["pending", "confirmed", "blocked"].filter(
  (status) => reservationStatusValues.includes(status),
);

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: reservations, error } = await supabase
  .from("reservations")
  .select("id,room_id,check_in,check_out,status")
  .in("status", deployedInventoryStatuses)
  .not("room_id", "is", null)
  .order("room_id")
  .order("check_in");

if (error) throw new Error(`Reservation preflight failed: ${error.message}`);

const activeOverlaps = [];
const rows = reservations ?? [];
for (let firstIndex = 0; firstIndex < rows.length; firstIndex += 1) {
  const first = rows[firstIndex];
  for (let secondIndex = firstIndex + 1; secondIndex < rows.length; secondIndex += 1) {
    const second = rows[secondIndex];
    if (second.room_id !== first.room_id) break;
    if (second.check_in >= first.check_out) break;
    if (first.check_in < second.check_out && first.check_out > second.check_in) {
      activeOverlaps.push({
        roomId: String(first.room_id),
        firstReservationId: String(first.id),
        secondReservationId: String(second.id),
      });
    }
  }
}

const summary = summarizeSchemaAudit({
  roomColumns,
  reservationColumns,
  reservationStatusValues,
  activeOverlaps,
});

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
if (summary.activeOverlapCount > 0) process.exitCode = 2;
