import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const routeFiles = [
  "src/app/api/admin/channels/route.ts",
  "src/app/api/admin/channels/[id]/route.ts",
  "src/app/api/admin/channels/[id]/mappings/route.ts",
  "src/app/api/admin/channels/[id]/mappings/[mappingId]/route.ts",
  "src/app/api/admin/channels/[id]/mappings/[mappingId]/rotate-token/route.ts",
  "src/app/api/admin/channels/[id]/validate/route.ts",
  "src/app/api/admin/channels/[id]/sync/route.ts",
  "src/app/api/admin/channels/[id]/runs/route.ts",
];

test("every channel admin route uses the server-side admin wrapper", () => {
  for (const file of routeFiles) {
    const source = readFileSync(path.join(process.cwd(), file), "utf8");
    assert.match(source, /withAdminRoute\s*\(/, file);
    if (/export const (POST|PATCH|DELETE)/.test(source)) {
      assert.match(source, /mutation:\s*true/, `${file} must validate mutation origin`);
    }
  }
});

test("admin route responses do not serialize stored secret columns", () => {
  const list = readFileSync(path.join(process.cwd(), routeFiles[0]), "utf8");
  const detail = readFileSync(path.join(process.cwd(), routeFiles[1]), "utf8");
  assert.match(list, /toChannelAdminDto/);
  assert.match(detail, /toChannelAdminDto/);
  assert.doesNotMatch(list, /NextResponse\.json\([^)]*import_url_encrypted/);
  const rotation = readFileSync(path.join(process.cwd(), routeFiles[4]), "utf8");
  assert.match(rotation, /randomBytes\(32\)/);
  assert.match(rotation, /createHash\("sha256"\)/);
  assert.doesNotMatch(rotation, /export_token_hash:\s*token/);
});
