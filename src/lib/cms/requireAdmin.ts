import { createAdminClient } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/admin";

/**
 * Content Studio uses the exact same authentication contract as the existing
 * Dar LaMamy admin APIs. Any authenticated admin session that can access the
 * current admin is therefore accepted here too.
 */
export async function requireAdmin() {
  const user = await requireAdminSession();
  const admin = createAdminClient();
  return { user, admin };
}
