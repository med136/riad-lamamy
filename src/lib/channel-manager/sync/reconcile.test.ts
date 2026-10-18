import assert from "node:assert/strict";
import test from "node:test";
import { reconcileExternalEvents } from "./reconcile.ts";

const incoming = (overrides: Record<string, unknown> = {}) => ({
  uid: "uid-1",
  checkIn: "2035-01-10",
  checkOut: "2035-01-12",
  status: "active" as const,
  sequence: 1,
  revision: "rev-1",
  summary: null,
  source: "airbnb",
  ...overrides,
});

const existing = (overrides: Record<string, unknown> = {}) => ({
  id: "reservation-1",
  uid: "uid-1",
  revision: "rev-1",
  status: "confirmed" as const,
  missingObservations: 0,
  ...overrides,
});

test("creates once, touches idempotent revisions, and updates changed revisions", () => {
  assert.deepEqual(
    reconcileExternalEvents([], [incoming()], { authoritative: true, mappingEnabled: true }).actions.map((a) => a.kind),
    ["create"],
  );
  assert.deepEqual(
    reconcileExternalEvents([existing()], [incoming()], { authoritative: true, mappingEnabled: true }).actions.map((a) => a.kind),
    ["touch"],
  );
  assert.deepEqual(
    reconcileExternalEvents([existing()], [incoming({ revision: "rev-2" })], { authoritative: true, mappingEnabled: true }).actions.map((a) => a.kind),
    ["update"],
  );
});

test("handles explicit cancellation and requires two authoritative missing observations", () => {
  assert.deepEqual(
    reconcileExternalEvents([existing()], [incoming({ status: "cancelled", revision: "rev-2" })], {
      authoritative: true,
      mappingEnabled: true,
    }).actions.map((a) => a.kind),
    ["cancel"],
  );
  assert.deepEqual(
    reconcileExternalEvents([existing()], [], { authoritative: true, mappingEnabled: true }).actions.map((a) => a.kind),
    ["mark_stale"],
  );
  assert.deepEqual(
    reconcileExternalEvents([existing({ missingObservations: 1 })], [], {
      authoritative: true,
      mappingEnabled: true,
    }).actions.map((a) => a.kind),
    ["cancel"],
  );
  assert.deepEqual(
    reconcileExternalEvents([existing()], [], { authoritative: false, mappingEnabled: true }).actions,
    [],
  );
});

test("creates conflicts for external overlaps and skips disabled mappings", () => {
  const conflict = reconcileExternalEvents([], [incoming()], {
    authoritative: true,
    mappingEnabled: true,
    overlapsLocal: () => true,
  });
  assert.deepEqual(conflict.actions.map((a) => a.kind), ["conflict"]);

  const skipped = reconcileExternalEvents([], [incoming()], {
    authoritative: true,
    mappingEnabled: false,
    overlapsLocal: () => {
      throw new Error("must not inspect disabled mappings");
    },
  });
  assert.equal(skipped.skipped, true);
  assert.deepEqual(skipped.actions, []);
});
