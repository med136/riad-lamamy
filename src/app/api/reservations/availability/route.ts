import { NextResponse } from "next/server";
import { quoteReservation } from "@/lib/reservations/domain";
import { ReservationError } from "@/lib/reservations/errors";
import { createReservationRepository } from "@/lib/reservations/repository";
import { createAdminClient } from "@/lib/supabase/adminClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = Number(body.room_id);
    if (!Number.isInteger(roomId)) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const quote = await quoteReservation(
      {
        roomId,
        checkIn: String(body.check_in ?? ""),
        checkOut: String(body.check_out ?? ""),
        adults: Number(body.adults_count ?? body.guest_count ?? 1),
        children: Number(body.children_count ?? 0),
      },
      createReservationRepository(createAdminClient()),
    );
    return NextResponse.json({ available: true, quote });
  } catch (error) {
    if (error instanceof ReservationError) {
      if (["room_unavailable", "availability_conflict"].includes(error.code)) {
        return NextResponse.json({ available: false, reason: error.code });
      }
      return NextResponse.json({ error: error.code }, { status: error.httpStatus });
    }
    return NextResponse.json({ error: "availability_check_failed" }, { status: 500 });
  }
}
