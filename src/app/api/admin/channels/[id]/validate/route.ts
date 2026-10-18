import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { decryptChannelSecret } from "@/lib/channel-manager/secrets";
import { fetchCalendarSafely } from "@/lib/channel-manager/fetch-calendar";
import { parseICalendar } from "@/lib/channel-manager/ical/parser";
import { uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string }> };

export const POST = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id } = await context.params;
      uuidSchema.parse(id);
      const { data: channel, error } = await admin.from("booking_channels").select("import_url_encrypted, provider").eq("id", id).single();
      if (error) throw error;
      if (!channel.import_url_encrypted) return NextResponse.json({ error: "import_url_missing" }, { status: 409 });
      const key = process.env.CHANNEL_ENCRYPTION_KEY;
      if (!key) throw new Error("channel_encryption_key_missing");
      try {
        const url = decryptChannelSecret(channel.import_url_encrypted, key);
        const fetched = await fetchCalendarSafely({ url });
        const events = parseICalendar(fetched.body, { source: channel.provider });
        await admin.from("booking_channels").update({ health: "healthy", consecutive_failures: 0, last_error_code: null }).eq("id", id);
        return NextResponse.json({ valid: true, eventCount: events.length, finalHost: new URL(fetched.finalUrl).hostname });
      } catch (validationError) {
        const code = validationError instanceof Error && /^[a-z0-9_]+$/i.test(validationError.message) ? validationError.message : "validation_failed";
        await admin.from("booking_channels").update({ health: "failing", last_error_code: code }).eq("id", id);
        return NextResponse.json({ valid: false, error: code }, { status: 422 });
      }
    },
    { mutation: true },
  );
