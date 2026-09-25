export type AdminAccessDecision =
  | "allow"
  | "unauthorized"
  | "forbidden"
  | "redirect-login"
  | "redirect-dashboard";

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
