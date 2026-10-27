export type AdminAccessDecision =
  | "allow"
  | "unauthorized"
  | "forbidden"
  | "redirect-login"
  | "redirect-dashboard";

export function isTrustedOrigin(origin: string | null, expectedOrigin: string) {
  if (!origin) return false;

  try {
    const actual = new URL(origin);
    const expected = new URL(expectedOrigin);
    const apex = (hostname: string) => hostname.toLowerCase().replace(/^www\./, "");

    return actual.protocol === expected.protocol &&
      actual.port === expected.port &&
      apex(actual.hostname) === apex(expected.hostname);
  } catch {
    return false;
  }
}

export function getAdminAccessDecision(
  pathname: string,
  hasUser: boolean,
  hasAdminProfile: boolean,
): AdminAccessDecision {
  const isAdminApi = pathname.startsWith("/api/admin/") || pathname === "/api/admin";
  const isAdminLogin = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin/") || pathname === "/admin";

  if (!isAdminApi && !isAdminPage) return "allow";
  if (isAdminLogin) {
    return hasUser && hasAdminProfile ? "redirect-dashboard" : "allow";
  }
  if (!hasUser) return isAdminApi ? "unauthorized" : "redirect-login";
  if (!hasAdminProfile) return isAdminApi ? "forbidden" : "redirect-login";
  return "allow";
}

export function isTrustedAdminMutationOrigin(
  pathname: string,
  method: string,
  origin: string | null,
  expectedOrigin: string,
) {
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (!isAdminApi || !isMutation) return true;
  return isTrustedOrigin(origin, expectedOrigin);
}
