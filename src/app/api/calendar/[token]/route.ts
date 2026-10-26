import { createHash } from "node:crypto";
import { buildAvailabilityCalendar } from "@/lib/channel-manager/ical/exporter";
import { createAdminClient } from "@/lib/supabase/adminClient";

type Context = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: Context) {
  const { token } = await context.params;
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return new Response("Not found", { status: 404 });
  const hash = createHash("sha256").update(token).digest("hex");
  const admin = createAdminClient();
  const { data: mapping, error } = await admin
    .from("channel_room_mappings")
    .select("id, room_id, rooms(name), booking_channels!inner(enabled, archived_at, connection_type)")
    .eq("export_token_hash", hash)
    .eq("enabled", true)
    .eq("booking_channels.enabled", true)
    .is("booking_channels.archived_at", null)
    .maybeSingle();
  if (error || !mapping) return new Response("Not found", { status: 404 });
  const channel = Array.isArray(mapping.booking_channels) ? mapping.booking_channels[0] : mapping.booking_channels;
  if (!["export", "bidirectional"].includes(channel.connection_type)) return new Response("Not found", { status: 404 });
  const { data: reservations, error: reservationError } = await admin
    .from("reservations")
    .select("id, check_in, check_out, status")
    .eq("room_id", mapping.room_id)
    .in("status", ["pending", "confirmed", "blocked"]);
  if (reservationError) return new Response("Calendar unavailable", { status: 503 });
  const room = Array.isArray(mapping.rooms) ? mapping.rooms[0] : mapping.rooms;
  const calendar = buildAvailabilityCalendar(
    { id: String(mapping.room_id), name: room?.name ?? "Room" },
    (reservations ?? []).map((reservation) => ({
      id: reservation.id,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      status: reservation.status,
    })),
  );
  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=availability.ics",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
