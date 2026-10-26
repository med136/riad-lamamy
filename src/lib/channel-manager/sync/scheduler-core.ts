import { randomUUID } from "node:crypto";
import type { SyncRunSummary } from "./service.ts";

export type DueMapping = { id: string; channelId: string; consecutiveFailures: number };
export type SchedulerDependencies = {
  getDueMappings(now: Date): Promise<DueMapping[]>;
  claim(mappingId: string, token: string): Promise<boolean>;
  sync(mappingId: string): Promise<SyncRunSummary>;
  recordOutcome(mapping: DueMapping, result: SyncRunSummary, now: Date): Promise<void>;
  release(mappingId: string, token: string): Promise<void>;
};

export async function runScheduledSync(now: Date, deps: SchedulerDependencies) {
  const due = await deps.getDueMappings(now);
  const results: Array<{ mappingId: string; status: string; errorCode?: string }> = [];
  for (const mapping of due) {
    const token = randomUUID();
    if (!(await deps.claim(mapping.id, token))) {
      results.push({ mappingId: mapping.id, status: "locked" });
      continue;
    }
    try {
      const result = await deps.sync(mapping.id);
      await deps.recordOutcome(mapping, result, now);
      results.push({ mappingId: mapping.id, status: result.status, errorCode: result.errorCode });
    } catch {
      const result = {
        status: "failed" as const,
        fetched: 0,
        created: 0,
        updated: 0,
        cancelled: 0,
        conflicts: 0,
        errorCode: "scheduler_sync_failed",
      };
      await deps.recordOutcome(mapping, result, now);
      results.push({ mappingId: mapping.id, status: result.status, errorCode: result.errorCode });
    } finally {
      await deps.release(mapping.id, token);
    }
  }
  return { due: due.length, succeeded: results.filter((item) => item.status === "succeeded").length, results };
}
