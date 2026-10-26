import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createDirectReservation } from "@/lib/reservations/domain";
import { ReservationError } from "@/lib/reservations/errors";
import { createReservationRepository } from "@/lib/reservations/repository";
import { parseRoomIdentifier } from "@/lib/reservations/room-identifier";

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
    const offset = (page - 1) * limit;
    let query = supabase
      .from("reservations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    const status = url.searchParams.get("status");
    const roomId = url.searchParams.get("room_id");
    const guestEmail = url.searchParams.get("guest_email");
    if (status) query = query.eq("status", status);
    if (roomId) query = query.eq("room_id", roomId);
    if (guestEmail) query = query.ilike("guest_email", `%${guestEmail}%`);
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;
    return NextResponse.json({
      reservations: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "reservation_query_failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = parseRoomIdentifier(body.room_id);
    if (!body.guest_name || !body.guest_email || !roomId) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const result = await createDirectReservation(
      {
        roomId,
        checkIn: String(body.check_in ?? ""),
        checkOut: String(body.check_out ?? ""),
        adults: Number(body.adults_count ?? body.guest_count ?? 1),
        children: Number(body.children_count ?? 0),
        guestName: String(body.guest_name),
        guestEmail: String(body.guest_email),
        guestPhone: body.guest_phone ? String(body.guest_phone) : null,
        specialRequests: body.special_requests ? String(body.special_requests) : null,
      },
      createReservationRepository(createAdminClient()),
    );
    return NextResponse.json(
      {
        id: result.id,
        reference: result.reference,
        status: result.status,
        total_amount: result.totalAmount,
        quote: result.quote,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ReservationError) {
      return NextResponse.json({ error: error.code }, { status: error.httpStatus });
    }
    console.error("Reservation creation failed", error);
    return NextResponse.json({ error: "reservation_creation_failed" }, { status: 500 });
  }
}
