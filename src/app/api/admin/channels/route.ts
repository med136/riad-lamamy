import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { toChannelAdminDto } from "@/lib/channel-manager/dto";
import { encryptChannelSecret } from "@/lib/channel-manager/secrets";
import { validateCalendarUrl } from "@/lib/channel-manager/network-policy";
import { channelCreateSchema } from "@/lib/channel-manager/validation";

export const GET = (request: Request) =>
  withAdminRoute(request, async ({ admin }) => {
    const { data, error } = await admin.from("booking_channels").select("*").is("archived_at", null).order("created_at");
    if (error) throw error;
    return NextResponse.json({ channels: (data ?? []).map(toChannelAdminDto) });
  });

export const POST = (request: Request) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const input = channelCreateSchema.parse(await request.json());
      let encrypted: string | null = null;
      let host: string | null = null;
      if (input.importUrl) {
        const target = await validateCalendarUrl(input.importUrl);
        const key = process.env.CHANNEL_ENCRYPTION_KEY;
        if (!key) throw new Error("channel_encryption_key_missing");
        encrypted = encryptChannelSecret(input.importUrl, key);
        host = target.hostname;
      }
      const { data, error } = await admin
        .from("booking_channels")
        .insert({
          name: input.name,
          provider: input.provider,
          connection_type: input.connectionType,
          enabled: false,
          import_url_encrypted: encrypted,
          import_url_host: host,
          sync_interval_minutes: input.syncIntervalMinutes,
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ channel: toChannelAdminDto(data) }, { status: 201 });
    },
    { mutation: true },
  );
