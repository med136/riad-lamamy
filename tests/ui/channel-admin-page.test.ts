import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("channel admin exposes configuration, mappings, activation, sync and history", async () => {
  const page = await readFile(new URL("../../src/app/admin/canaux/page.tsx", import.meta.url), "utf8");
  for (const contract of [
    "/api/admin/channels",
    "/mappings",
    "/rotate-token",
    "/validate",
    "/sync",
    "/runs?limit=10",
    "Créer désactivé",
    "Historique des synchronisations",
  ]) assert.ok(page.includes(contract), contract);
});

test("channel manager is reachable from admin navigation", async () => {
  const [sidebar, header] = await Promise.all([
    readFile(new URL("../../src/components/admin/Sidebar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../src/components/admin/Header.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(sidebar, /\/admin\/canaux/);
  assert.match(header, /\/admin\/canaux/);
});
