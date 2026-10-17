import assert from "node:assert/strict";
import test from "node:test";

import { selectRoomPreviewItems } from "./room-preview.ts";

test("conserve les quatre premières chambres pour remplir la ligne desktop", () => {
  const rooms = ["Al Yakout", "Cylia", "Jawhara", "Tasnime", "Suite"];

  assert.deepEqual(selectRoomPreviewItems(rooms), [
    "Al Yakout",
    "Cylia",
    "Jawhara",
    "Tasnime",
  ]);
});
