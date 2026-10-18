import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { toMappingAdminDto } from "@/lib/channel-manager/dto";
import { mappingCreateSchema, uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string }> };

export const GET = (request: Request, context: Context) =>
  withAdminRoute(request, async ({ admin }) => {
    const { id } = await context.params;
    uuidSchema.parse(id);
    const { data, error } = await admin.from("channel_room_mappings").select("*").eq("channel_id", id).order("created_at");
    if (error) throw error;
    return NextResponse.json({ mappings: (data ?? []).map(toMappingAdminDto) });
  });

export const POST = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id } = await context.params;
      uuidSchema.parse(id);
      const input = mappingCreateSchema.parse(await request.json());
      const { data, error } = await admin
        .from("channel_room_mappings")
        .insert({ channel_id: id, room_id: input.roomId, external_room_id: input.externalRoomId ?? null, enabled: false })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ mapping: toMappingAdminDto(data) }, { status: 201 });
    },
    { mutation: true },
  );
