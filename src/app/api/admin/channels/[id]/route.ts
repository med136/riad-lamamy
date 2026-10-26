import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { toChannelAdminDto } from "@/lib/channel-manager/dto";
import { encryptChannelSecret } from "@/lib/channel-manager/secrets";
import { validateCalendarUrl } from "@/lib/channel-manager/network-policy";
import { channelUpdateSchema, uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string }> };

export const GET = (request: Request, context: Context) =>
  withAdminRoute(request, async ({ admin }) => {
    const { id } = await context.params;
    uuidSchema.parse(id);
    const { data, error } = await admin.from("booking_channels").select("*").eq("id", id).is("archived_at", null).single();
    if (error) throw error;
    return NextResponse.json({ channel: toChannelAdminDto(data) });
  });

export const PATCH = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id } = await context.params;
      uuidSchema.parse(id);
      const input = channelUpdateSchema.parse(await request.json());
      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.connectionType !== undefined) patch.connection_type = input.connectionType;
      if (input.syncIntervalMinutes !== undefined) patch.sync_interval_minutes = input.syncIntervalMinutes;
      if (input.importUrl !== undefined) {
        if (input.importUrl === null) {
          patch.import_url_encrypted = null;
          patch.import_url_host = null;
        } else {
          const target = await validateCalendarUrl(input.importUrl);
          const key = process.env.CHANNEL_ENCRYPTION_KEY;
          if (!key) throw new Error("channel_encryption_key_missing");
          patch.import_url_encrypted = encryptChannelSecret(input.importUrl, key);
          patch.import_url_host = target.hostname;
          patch.health = "not_configured";
        }
      }
      if (input.enabled !== undefined) {
        if (input.enabled) {
          const { data: current, error: currentError } = await admin
            .from("booking_channels")
            .select("connection_type, health, import_url_encrypted")
            .eq("id", id)
            .single();
          if (currentError) throw currentError;
          const { data: mappings, error: mappingError } = await admin
            .from("channel_room_mappings")
            .select("id, export_token_hash")
            .eq("channel_id", id)
            .eq("enabled", true);
          if (mappingError) throw mappingError;
          if (!mappings?.length) return NextResponse.json({ error: "enabled_mapping_required" }, { status: 409 });
          if (["import", "bidirectional"].includes(current.connection_type) && (!current.import_url_encrypted || current.health !== "healthy")) {
            return NextResponse.json({ error: "validated_import_required" }, { status: 409 });
          }
          if (["export", "bidirectional"].includes(current.connection_type) && mappings.some((mapping) => !mapping.export_token_hash)) {
            return NextResponse.json({ error: "export_token_required" }, { status: 409 });
          }
        }
        patch.enabled = input.enabled;
        patch.health = input.enabled ? "not_configured" : "disabled";
      }
      const { data, error } = await admin.from("booking_channels").update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return NextResponse.json({ channel: toChannelAdminDto(data) });
    },
    { mutation: true },
  );

export const DELETE = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id } = await context.params;
      uuidSchema.parse(id);
      const { error } = await admin.from("booking_channels").update({ enabled: false, health: "disabled", archived_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return new Response(null, { status: 204 });
    },
    { mutation: true },
  );
