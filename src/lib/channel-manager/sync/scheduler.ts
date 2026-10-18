import type { createAdminClient } from "../../supabase/adminClient";
import { runMappingSync } from "./runtime";
import { retryDelayMs, shouldRetrySync } from "./retry";
import type { SchedulerDependencies } from "./scheduler-core";

export { runScheduledSync } from "./scheduler-core";

export function createSchedulerDependencies(admin: ReturnType<typeof createAdminClient>): SchedulerDependencies {
  return {
    async getDueMappings(now) {
      const { data, error } = await admin
        .from("channel_room_mappings")
        .select("id, last_synced_at, next_retry_at, channel_id, booking_channels!inner(enabled, archived_at, sync_interval_minutes, consecutive_failures)")
        .eq("enabled", true)
        .eq("booking_channels.enabled", true)
        .is("booking_channels.archived_at", null);
      if (error) throw error;
      return (data ?? [])
        .filter((row) => {
          const channel = Array.isArray(row.booking_channels) ? row.booking_channels[0] : row.booking_channels;
          if (row.next_retry_at && new Date(row.next_retry_at) > now) return false;
          if (!row.last_synced_at) return true;
          return now.getTime() - new Date(row.last_synced_at).getTime() >= Number(channel.sync_interval_minutes) * 60_000;
        })
        .map((row) => {
          const channel = Array.isArray(row.booking_channels) ? row.booking_channels[0] : row.booking_channels;
          return { id: row.id, channelId: row.channel_id, consecutiveFailures: Number(channel.consecutive_failures ?? 0) };
        });
    },
    async claim(mappingId, token) {
      const { data, error } = await admin.rpc("claim_channel_sync_lock", { p_mapping_id: mappingId, p_lock_token: token, p_ttl_seconds: 300 });
      if (error) throw error;
      return data === true;
    },
    sync: (mappingId) => runMappingSync(mappingId, "scheduled", admin),
    async recordOutcome(mapping, result, now) {
      if (result.status === "succeeded") {
        const timestamp = now.toISOString();
        const [{ error: channelError }, { error: mappingError }] = await Promise.all([
          admin.from("booking_channels").update({ health: "healthy", consecutive_failures: 0, last_synced_at: timestamp, last_error_code: null }).eq("id", mapping.channelId),
          admin.from("channel_room_mappings").update({ next_retry_at: null }).eq("id", mapping.id),
        ]);
        if (channelError) throw channelError;
        if (mappingError) throw mappingError;
        return;
      }
      if (result.status !== "failed") return;
      const attempt = mapping.consecutiveFailures + 1;
      const retryAt = shouldRetrySync(result.errorCode, attempt)
        ? new Date(now.getTime() + retryDelayMs(attempt)).toISOString()
        : null;
      const [{ error: channelError }, { error: mappingError }] = await Promise.all([
        admin.from("booking_channels").update({
          health: attempt >= 3 ? "failing" : "degraded",
          consecutive_failures: attempt,
          last_error_code: result.errorCode ?? "sync_failed",
        }).eq("id", mapping.channelId),
        admin.from("channel_room_mappings").update({ next_retry_at: retryAt }).eq("id", mapping.id),
      ]);
      if (channelError) throw channelError;
      if (mappingError) throw mappingError;
    },
    async release(mappingId, token) {
      const { error } = await admin.rpc("release_channel_sync_lock", { p_mapping_id: mappingId, p_lock_token: token });
      if (error) throw error;
    },
  };
}
