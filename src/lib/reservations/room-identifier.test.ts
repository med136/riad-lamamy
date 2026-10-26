import assert from "node:assert/strict";
import test from "node:test";
import { parseRoomIdentifier } from "./room-identifier.ts";

test("preserves a Supabase UUID room identifier", () => {
  assert.equal(
    parseRoomIdentifier("e46fc167-333c-4913-a970-83791e5fd2b5"),
    "e46fc167-333c-4913-a970-83791e5fd2b5",
  );
});

test("accepts legacy numeric identifiers without coercing them", () => {
  assert.equal(parseRoomIdentifier(7), "7");
});

test("rejects missing or structurally invalid identifiers", () => {
  assert.equal(parseRoomIdentifier("  "), null);
  assert.equal(parseRoomIdentifier(undefined), null);
  assert.equal(parseRoomIdentifier({ id: "room" }), null);
});
