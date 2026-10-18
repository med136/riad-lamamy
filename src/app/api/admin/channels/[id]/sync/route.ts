import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { runMappingSync } from "@/lib/channel-manager/sync/runtime";
import { uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string }> };

export const POST = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id } = await context.params;
      uuidSchema.parse(id);
      const body = (await request.json().catch(() => ({}))) as { mappingId?: string };
      if (body.mappingId) uuidSchema.parse(body.mappingId);
      let query = admin.from("channel_room_mappings").select("id").eq("channel_id", id).eq("enabled", true);
      if (body.mappingId) query = query.eq("id", body.mappingId);
      const { data, error } = await query;
      if (error) throw error;
      const results = [];
      for (const mapping of data ?? []) results.push(await runMappingSync(mapping.id, "manual", admin));
      return NextResponse.json({ results });
    },
    { mutation: true },
  );
