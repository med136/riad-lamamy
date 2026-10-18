import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string }> };

export const GET = (request: Request, context: Context) =>
  withAdminRoute(request, async ({ admin }) => {
    const { id } = await context.params;
    uuidSchema.parse(id);
    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 25));
    const { data, error } = await admin
      .from("channel_sync_runs")
      .select("id, mapping_id, trigger, status, fetched_count, created_count, updated_count, cancelled_count, conflict_count, error_code, started_at, completed_at")
      .eq("channel_id", id)
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return NextResponse.json({ runs: data ?? [] });
  });
