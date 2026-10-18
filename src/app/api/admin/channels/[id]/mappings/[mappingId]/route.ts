import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { toMappingAdminDto } from "@/lib/channel-manager/dto";
import { mappingUpdateSchema, uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string; mappingId: string }> };

export const PATCH = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id, mappingId } = await context.params;
      uuidSchema.parse(id);
      uuidSchema.parse(mappingId);
      const input = mappingUpdateSchema.parse(await request.json());
      const patch: Record<string, unknown> = {};
      if (input.enabled !== undefined) patch.enabled = input.enabled;
      if (input.externalRoomId !== undefined) patch.external_room_id = input.externalRoomId;
      const { data, error } = await admin
        .from("channel_room_mappings")
        .update(patch)
        .eq("id", mappingId)
        .eq("channel_id", id)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ mapping: toMappingAdminDto(data) });
    },
    { mutation: true },
  );

export const DELETE = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id, mappingId } = await context.params;
      uuidSchema.parse(id);
      uuidSchema.parse(mappingId);
      const { error } = await admin.from("channel_room_mappings").update({ enabled: false }).eq("id", mappingId).eq("channel_id", id);
      if (error) throw error;
      return new Response(null, { status: 204 });
    },
    { mutation: true },
  );
