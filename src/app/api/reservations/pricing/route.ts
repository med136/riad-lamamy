import { NextResponse } from "next/server";
import { quoteReservation } from "@/lib/reservations/domain";
import { ReservationError } from "@/lib/reservations/errors";
import { createReservationRepository } from "@/lib/reservations/repository";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { parseRoomIdentifier } from "@/lib/reservations/room-identifier";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = parseRoomIdentifier(body.room_id);
    if (!roomId) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const quote = await quoteReservation(
      {
        roomId,
        checkIn: String(body.check_in ?? ""),
        checkOut: String(body.check_out ?? ""),
        adults: Number(body.adults_count ?? 1),
        children: Number(body.children_count ?? 0),
      },
      createReservationRepository(createAdminClient()),
    );
    return NextResponse.json({
      room_id: quote.roomId,
      room_name: quote.roomName,
      nights: quote.nights,
      total_price: quote.totalAmount,
      total_amount: quote.totalAmount,
      currency: quote.currency,
    });
  } catch (error) {
    if (error instanceof ReservationError) {
      return NextResponse.json({ error: error.code }, { status: error.httpStatus });
    }
    return NextResponse.json({ error: "pricing_failed" }, { status: 500 });
  }
}
