import assert from "node:assert/strict";
import test from "node:test";

import { getAdminAccessDecision, isTrustedAdminMutationOrigin } from "./admin-auth.ts";

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

test("refuse toute mutation API admin sans Origin exact", () => {
  const expected = "https://riad.example";
  assert.equal(isTrustedAdminMutationOrigin("/api/admin/rooms", "POST", null, expected), false);
  assert.equal(isTrustedAdminMutationOrigin("/api/admin/rooms", "DELETE", "https://evil.example", expected), false);
  assert.equal(isTrustedAdminMutationOrigin("/api/admin/rooms", "PATCH", expected, expected), true);
  assert.equal(isTrustedAdminMutationOrigin("/api/admin/rooms", "GET", null, expected), true);
  assert.equal(isTrustedAdminMutationOrigin("/api/public/settings", "POST", null, expected), true);
});

test("accepte uniquement les variantes www et apex du domaine canonique", () => {
  assert.equal(
    isTrustedAdminMutationOrigin("/api/admin/channels", "POST", "https://www.darlamamy.com", "https://darlamamy.com"),
    true,
  );
  assert.equal(
    isTrustedAdminMutationOrigin("/api/admin/channels", "POST", "https://darlamamy.com", "https://www.darlamamy.com"),
    true,
  );
  assert.equal(
    isTrustedAdminMutationOrigin("/api/admin/channels", "POST", "http://darlamamy.com", "https://darlamamy.com"),
    false,
  );
  assert.equal(
    isTrustedAdminMutationOrigin("/api/admin/channels", "POST", "https://fake-darlamamy.com", "https://darlamamy.com"),
    false,
  );
});
