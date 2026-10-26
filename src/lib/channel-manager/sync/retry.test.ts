import assert from "node:assert/strict";
import test from "node:test";
import { retryDelayMs, shouldRetrySync } from "./retry.ts";

test("uses bounded exponential backoff with deterministic cap", () => {
  assert.equal(retryDelayMs(1), 60_000);
  assert.equal(retryDelayMs(2), 120_000);
  assert.equal(retryDelayMs(5), 900_000);
  assert.equal(retryDelayMs(20), 900_000);
});

test("retries transient errors only within the attempt limit", () => {
  assert.equal(shouldRetrySync("timeout", 1), true);
  assert.equal(shouldRetrySync("upstream_status_503", 2), true);
  assert.equal(shouldRetrySync("unsafe_address", 1), false);
  assert.equal(shouldRetrySync("invalid_event_date", 1), false);
  assert.equal(shouldRetrySync("timeout", 3), false);
});
