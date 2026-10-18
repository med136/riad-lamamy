import assert from "node:assert/strict";
import test from "node:test";
import { runScheduledSync, type SchedulerDependencies } from "./scheduler-core.ts";

const success = { status: "succeeded" as const, fetched: 1, created: 1, updated: 0, cancelled: 0, conflicts: 0 };

test("locked mappings are isolated and never synchronized", async () => {
  let syncCalls = 0;
  const deps: SchedulerDependencies = {
    getDueMappings: async () => [{ id: "one", channelId: "channel", consecutiveFailures: 0 }],
    claim: async () => false,
    sync: async () => {
      syncCalls += 1;
      return success;
    },
    recordOutcome: async () => undefined,
    release: async () => undefined,
  };
  const result = await runScheduledSync(new Date(), deps);
  assert.equal(syncCalls, 0);
  assert.equal(result.results[0].status, "locked");
});

test("one mapping failure does not stop another mapping and locks are released", async () => {
  const released: string[] = [];
  const deps: SchedulerDependencies = {
    getDueMappings: async () => [
      { id: "bad", channelId: "a", consecutiveFailures: 0 },
      { id: "good", channelId: "b", consecutiveFailures: 0 },
    ],
    claim: async () => true,
    sync: async (id) => {
      if (id === "bad") throw new Error("network secret must not leak");
      return success;
    },
    recordOutcome: async () => undefined,
    release: async (id) => {
      released.push(id);
    },
  };
  const result = await runScheduledSync(new Date(), deps);
  assert.deepEqual(released, ["bad", "good"]);
  assert.equal(result.succeeded, 1);
  assert.equal(result.results[0].errorCode, "scheduler_sync_failed");
});
