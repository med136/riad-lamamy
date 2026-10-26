import { createHash } from "node:crypto";
import type { createAdminClient } from "../../supabase/adminClient.ts";
import { isAvailabilityConflict } from "../../reservations/errors.ts";
import type { ParsedCalendarEvent } from "../ical/parser";
import type { ReconciliationAction, ReconciliationPlan } from "./reconcile";
import type { SyncCounts, SyncDependencies, SyncMappingRecord } from "./service";

type Client = ReturnType<typeof createAdminClient>;

const identity = (mappingId: string, uid: string) =>
  createHash("sha256").update(`${mappingId}:${uid}`).digest("hex");

export function createSyncRepository(client: Client) {
  const createConflict = async (
    mapping: SyncMappingRecord,
    event: ParsedCalendarEvent,
    reservationId?: string,
  ) => {
    const { error } = await client.from("reservation_conflicts").insert({
      reservation_id: reservationId ?? null,
      channel_id: mapping.channelId,
      mapping_id: mapping.id,
      external_uid: event.uid,
      kind: "overlap",
      details: { check_in: event.checkIn, check_out: event.checkOut, revision: event.revision },
    });
    if (error) throw error;
  };

  const applyAction = async (
    action: ReconciliationAction,
    mapping: SyncMappingRecord,
    counts: SyncCounts,
  ) => {
    if (action.kind === "conflict") {
      await createConflict(mapping, action.event, action.reservationId);
      counts.conflicts += 1;
      return;
    }
    if (action.kind === "create") {
      const digest = identity(mapping.id, action.event.uid);
      const { error } = await client.from("reservations").insert({
        reference: `EXT-${digest.slice(0, 16).toUpperCase()}`,
        guest_name: "External availability",
        guest_email: `external-${digest.slice(0, 20)}@calendar.invalid`,
        guest_count: 1,
        room_id: mapping.roomId,
        check_in: action.event.checkIn,
        check_out: action.event.checkOut,
        total_amount: 0,
        paid_amount: 0,
        status: "blocked",
        source: mapping.source,
        channel_id: mapping.channelId,
        channel_mapping_id: mapping.id,
        external_uid: action.event.uid,
        external_revision: action.event.revision,
        external_status: action.event.status,
        imported_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        external_missing_observations: 0,
        raw_external_data: { sequence: action.event.sequence },
      });
      if (error) {
        if (isAvailabilityConflict(error)) {
          await createConflict(mapping, action.event);
          counts.conflicts += 1;
          return;
        }
        throw error;
      }
      counts.created += 1;
      return;
    }
    if (action.kind === "touch") {
      const { error } = await client
        .from("reservations")
        .update({ last_seen_at: new Date().toISOString(), external_missing_observations: 0 })
        .eq("id", action.reservationId);
      if (error) throw error;
      return;
    }
    if (action.kind === "mark_stale") {
      const { data, error: readError } = await client
        .from("reservations")
        .select("external_missing_observations")
        .eq("id", action.reservationId)
        .single();
      if (readError) throw readError;
      const { error } = await client
        .from("reservations")
        .update({ external_missing_observations: Number(data.external_missing_observations ?? 0) + 1 })
        .eq("id", action.reservationId);
      if (error) throw error;
      return;
    }
    if (action.kind === "cancel") {
      const { error } = await client
        .from("reservations")
        .update({
          status: "cancelled",
          external_status: action.event?.status ?? "missing",
          external_revision: action.event?.revision,
          last_seen_at: action.event ? new Date().toISOString() : undefined,
          external_missing_observations: action.reason === "missing_twice" ? 2 : 0,
        })
        .eq("id", action.reservationId);
      if (error) throw error;
      counts.cancelled += 1;
      return;
    }
    if (action.kind === "update") {
      const { error } = await client
        .from("reservations")
        .update({
          check_in: action.event.checkIn,
          check_out: action.event.checkOut,
          status: "blocked",
          external_revision: action.event.revision,
          external_status: action.event.status,
          last_seen_at: new Date().toISOString(),
          external_missing_observations: 0,
          raw_external_data: { sequence: action.event.sequence },
        })
        .eq("id", action.reservationId);
      if (error) {
        if (isAvailabilityConflict(error)) {
          await createConflict(mapping, action.event, action.reservationId);
          counts.conflicts += 1;
          return;
        }
        throw error;
      }
      counts.updated += 1;
    }
  };

  return {
    async loadMapping(id: string): Promise<SyncMappingRecord | null> {
      const { data: mapping, error } = await client.from("channel_room_mappings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!mapping) return null;
      const { data: channel, error: channelError } = await client.from("booking_channels").select("*").eq("id", mapping.channel_id).single();
      if (channelError) throw channelError;
      return {
        id: mapping.id,
        channelId: channel.id,
        roomId: Number(mapping.room_id),
        enabled: mapping.enabled,
        channelEnabled: channel.enabled,
        encryptedUrl: channel.import_url_encrypted,
        source: channel.provider,
      };
    },
    async loadExisting(mappingId: string) {
      const { data, error } = await client
        .from("reservations")
        .select("id, external_uid, external_revision, status, external_missing_observations")
        .eq("channel_mapping_id", mappingId)
        .not("external_uid", "is", null);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        uid: String(row.external_uid),
        revision: row.external_revision,
        status: row.status,
        missingObservations: Number(row.external_missing_observations ?? 0),
      }));
    },
    async loadLocalReservations(roomId: number) {
      const { data, error } = await client
        .from("reservations")
        .select("id, check_in, check_out, status")
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed", "blocked"]);
      if (error) throw error;
      return (data ?? []).map((row) => ({ id: row.id, checkIn: row.check_in, checkOut: row.check_out, status: row.status }));
    },
    async applyPlan(plan: ReconciliationPlan, mapping: SyncMappingRecord) {
      const counts: SyncCounts = { created: 0, updated: 0, cancelled: 0, conflicts: 0 };
      for (const action of plan.actions) await applyAction(action, mapping, counts);
      const { error } = await client
        .from("channel_room_mappings")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", mapping.id);
      if (error) throw error;
      return counts;
    },
    async startRun(run: { mappingId: string; channelId: string; trigger: string }) {
      const { data, error } = await client
        .from("channel_sync_runs")
        .insert({ mapping_id: run.mappingId, channel_id: run.channelId, trigger: run.trigger, status: "running" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    async finishRun(runId: string, result: { status: string; fetched: number; counts: SyncCounts; errorCode?: string }) {
      const { error } = await client
        .from("channel_sync_runs")
        .update({
          status: result.status,
          fetched_count: result.fetched,
          created_count: result.counts.created,
          updated_count: result.counts.updated,
          cancelled_count: result.counts.cancelled,
          conflict_count: result.counts.conflicts,
          error_code: result.errorCode ?? null,
          error_summary: result.errorCode ?? null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);
      if (error) throw error;
    },
  } satisfies Pick<SyncDependencies, "loadMapping" | "loadExisting" | "loadLocalReservations" | "applyPlan" | "startRun" | "finishRun">;
}
