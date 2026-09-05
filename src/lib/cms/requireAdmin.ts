import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/adminClient";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("admin_profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) throw new Error("FORBIDDEN");
  return { user, admin, profile };
}
