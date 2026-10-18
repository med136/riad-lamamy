import type { ParsedCalendarEvent } from "../ical/parser.ts";
import {
  reconcileExternalEvents,
  type ExistingExternalReservation,
  type ReconciliationPlan,
} from "./reconcile.ts";

export type SyncTrigger = "manual" | "scheduled" | "retry" | "validation";
export type SyncMappingRecord = {
  id: string;
  channelId: string;
  roomId: number;
  enabled: boolean;
  channelEnabled: boolean;
  encryptedUrl: string | null;
  source: string;
};
export type LocalReservation = { id: string; checkIn: string; checkOut: string; status: string };
export type SyncCounts = { created: number; updated: number; cancelled: number; conflicts: number };
export type SyncRunSummary = SyncCounts & { status: "succeeded" | "failed" | "skipped"; fetched: number; errorCode?: string };

export type SyncDependencies = {
  loadMapping(id: string): Promise<SyncMappingRecord | null>;
  decryptUrl(payload: string): string;
  fetchCalendar(url: string): Promise<{ body: string; finalUrl: string }>;
  parseCalendar(text: string, source: string): ParsedCalendarEvent[];
  loadExisting(mappingId: string): Promise<ExistingExternalReservation[]>;
  loadLocalReservations(roomId: number): Promise<LocalReservation[]>;
  applyPlan(plan: ReconciliationPlan, mapping: SyncMappingRecord): Promise<SyncCounts>;
  startRun(run: { mappingId: string; channelId: string; trigger: SyncTrigger }): Promise<string>;
  finishRun(runId: string, result: { status: string; fetched: number; counts: SyncCounts; errorCode?: string }): Promise<void>;
};

const zeroCounts = (): SyncCounts => ({ created: 0, updated: 0, cancelled: 0, conflicts: 0 });

export async function syncMapping(
  mappingId: string,
  trigger: SyncTrigger,
  deps: SyncDependencies,
): Promise<SyncRunSummary> {
  const mapping = await deps.loadMapping(mappingId);
  if (!mapping) return { status: "failed", fetched: 0, ...zeroCounts(), errorCode: "mapping_not_found" };
  const runId = await deps.startRun({ mappingId, channelId: mapping.channelId, trigger });
  if (!mapping.enabled || !mapping.channelEnabled) {
    const counts = zeroCounts();
    await deps.finishRun(runId, { status: "skipped", fetched: 0, counts });
    return { status: "skipped", fetched: 0, ...counts };
  }
  if (!mapping.encryptedUrl) {
    const counts = zeroCounts();
    await deps.finishRun(runId, { status: "failed", fetched: 0, counts, errorCode: "import_url_missing" });
    return { status: "failed", fetched: 0, ...counts, errorCode: "import_url_missing" };
  }

  try {
    const url = deps.decryptUrl(mapping.encryptedUrl);
    const fetched = await deps.fetchCalendar(url);
    const events = deps.parseCalendar(fetched.body, mapping.source);
    const [existing, local] = await Promise.all([
      deps.loadExisting(mappingId),
      deps.loadLocalReservations(mapping.roomId),
    ]);
    const plan = reconcileExternalEvents(existing, events, {
      authoritative: true,
      mappingEnabled: true,
      overlapsLocal: (event, reservationId) =>
        local.some(
          (candidate) =>
            candidate.id !== reservationId &&
            ["pending", "confirmed", "blocked"].includes(candidate.status) &&
            candidate.checkIn < event.checkOut &&
            candidate.checkOut > event.checkIn,
        ),
    });
    const counts = await deps.applyPlan(plan, mapping);
    await deps.finishRun(runId, { status: "succeeded", fetched: events.length, counts });
    return { status: "succeeded", fetched: events.length, ...counts };
  } catch (error) {
    const errorCode = error instanceof Error && /^[a-z0-9_]+$/i.test(error.message) ? error.message : "sync_failed";
    const counts = zeroCounts();
    await deps.finishRun(runId, { status: "failed", fetched: 0, counts, errorCode });
    return { status: "failed", fetched: 0, ...counts, errorCode };
  }
}
