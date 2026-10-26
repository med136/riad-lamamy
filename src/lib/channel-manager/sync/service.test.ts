import assert from "node:assert/strict";
import test from "node:test";
import { syncMapping, type SyncDependencies } from "./service.ts";

const mapping = {
  id: "mapping-1",
  channelId: "channel-1",
  roomId: "4e8cb34c-f09f-4fc5-b847-0645c349276a",
  enabled: true,
  channelEnabled: true,
  encryptedUrl: "encrypted",
  source: "airbnb",
};

const deps = (overrides: Partial<SyncDependencies> = {}): SyncDependencies => ({
  loadMapping: async () => mapping,
  decryptUrl: () => "https://calendar.example/feed.ics",
  fetchCalendar: async () => ({ body: "calendar", finalUrl: "https://calendar.example/feed.ics" }),
  parseCalendar: () => [],
  loadExisting: async () => [],
  loadLocalReservations: async () => [],
  applyPlan: async () => ({ created: 0, updated: 0, cancelled: 0, conflicts: 0 }),
  startRun: async () => "run-1",
  finishRun: async () => undefined,
  ...overrides,
});

test("disabled channel or mapping skips before decrypting or fetching", async () => {
  let fetched = false;
  const result = await syncMapping(
    "mapping-1",
    "manual",
    deps({
      loadMapping: async () => ({ ...mapping, channelEnabled: false }),
      fetchCalendar: async () => {
        fetched = true;
        throw new Error("must not fetch");
      },
    }),
  );
  assert.equal(result.status, "skipped");
  assert.equal(fetched, false);
});

test("one service path fetches, reconciles, persists and records sanitized counts", async () => {
  const recorded: string[] = [];
  const result = await syncMapping(
    "mapping-1",
    "scheduled",
    deps({
      parseCalendar: () => [
        {
          uid: "uid-1",
          checkIn: "2035-04-01",
          checkOut: "2035-04-03",
          status: "active",
          sequence: 0,
          revision: "rev",
          summary: null,
          source: "airbnb",
        },
      ],
      applyPlan: async (plan) => {
        assert.deepEqual(plan.actions.map((action) => action.kind), ["create"]);
        return { created: 1, updated: 0, cancelled: 0, conflicts: 0 };
      },
      startRun: async () => {
        recorded.push("running");
        return "run-1";
      },
      finishRun: async (_runId, run) => {
        recorded.push(run.status);
      },
    }),
  );
  assert.equal(result.status, "succeeded");
  assert.equal(result.created, 1);
  assert.deepEqual(recorded, ["running", "succeeded"]);
});
