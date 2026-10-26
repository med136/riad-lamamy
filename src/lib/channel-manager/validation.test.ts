import assert from "node:assert/strict";
import test from "node:test";
import { channelCreateSchema, channelUpdateSchema, mappingCreateSchema, uuidSchema } from "./validation.ts";

test("validates supported providers, UUIDs, intervals and HTTPS URLs", () => {
  assert.equal(channelCreateSchema.safeParse({ name: "Airbnb", provider: "airbnb", connectionType: "bidirectional", importUrl: "https://calendar.example/feed", syncIntervalMinutes: 15 }).success, true);
  assert.equal(channelCreateSchema.safeParse({ name: "Bad", provider: "unknown", connectionType: "import" }).success, false);
  assert.equal(channelCreateSchema.safeParse({ name: "Bad", provider: "custom", connectionType: "import", importUrl: "http://localhost/feed" }).success, false);
  assert.equal(channelCreateSchema.safeParse({ name: "Bad", provider: "custom", connectionType: "import", unknown: true }).success, false);
  assert.equal(channelUpdateSchema.safeParse({ syncIntervalMinutes: 14 }).success, false);
  assert.equal(mappingCreateSchema.safeParse({ roomId: -1 }).success, false);
  assert.equal(mappingCreateSchema.safeParse({ roomId: "4e8cb34c-f09f-4fc5-b847-0645c349276a" }).success, true);
  assert.equal(uuidSchema.safeParse("not-a-uuid").success, false);
});
