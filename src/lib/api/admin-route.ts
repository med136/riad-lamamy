import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { ZodError } from "zod";

export class ForbiddenAdminError extends Error {}
export class InvalidOriginError extends Error {}

const assertTrustedOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url).origin;
  if (!origin || origin !== expected) throw new InvalidOriginError("invalid_origin");
};

export async function withAdminRoute(
  request: Request,
  handler: (context: { admin: ReturnType<typeof createAdminClient>; userId: string }) => Promise<Response>,
  options: { mutation?: boolean } = {},
) {
  try {
    if (options.mutation) assertTrustedOrigin(request);
    const user = await requireAdminSession();
    const admin = createAdminClient();
    const { data, error } = await admin.from("admin_profiles").select("id").eq("id", user.id).maybeSingle();
    if (error || !data) throw new ForbiddenAdminError("admin_required");
    return await handler({ admin, userId: user.id });
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (error instanceof ForbiddenAdminError) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof InvalidOriginError) return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "invalid_request", issues: error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })) }, { status: 400 });
    }
    console.error("Admin route failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
