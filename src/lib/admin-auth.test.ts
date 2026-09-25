import assert from "node:assert/strict";
import test from "node:test";

import { getAdminAccessDecision } from "./admin-auth.ts";

test("laisse passer les routes publiques", () => {
  assert.equal(getAdminAccessDecision("/api/services", false, false), "allow");
});

test("renvoie unauthorized pour une API admin sans session", () => {
  assert.equal(getAdminAccessDecision("/api/admin/services", false, false), "unauthorized");
});

test("renvoie forbidden pour une API admin sans profil admin", () => {
  assert.equal(getAdminAccessDecision("/api/admin/services", true, false), "forbidden");
});

test("autorise une API admin avec une session et un profil admin", () => {
  assert.equal(getAdminAccessDecision("/api/admin/services", true, true), "allow");
});

test("redirige les pages admin sans session ou sans profil admin", () => {
  assert.equal(getAdminAccessDecision("/admin/services", false, false), "redirect-login");
  assert.equal(getAdminAccessDecision("/admin/services", true, false), "redirect-login");
});

test("la page de connexion reste publique", () => {
  assert.equal(getAdminAccessDecision("/admin/login", false, false), "allow");
});
