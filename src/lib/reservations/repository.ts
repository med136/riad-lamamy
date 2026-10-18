import type { createAdminClient } from "@/lib/supabase/adminClient";
import type {
  AuthoritativeCreateInput,
  BookingSettings,
  ReservationDependencies,
  ReservationRoom,
} from "./domain";

type DatabaseClient = ReturnType<typeof createAdminClient>;

const numberOr = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function createReservationRepository(client: DatabaseClient): ReservationDependencies {
  return {
    async getRoom(roomId): Promise<ReservationRoom | null> {
      const { data, error } = await client
        .from("rooms")
        .select("id, name, base_price, max_guests, status, seasonal_prices")
        .eq("id", roomId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: Number(data.id),
        name: data.name,
        basePrice: numberOr(data.base_price, 0),
        maxGuests: numberOr(data.max_guests, 2),
        status: data.status ?? "available",
        seasonalPrices: data.seasonal_prices ?? null,
      };
    },

    async getSettings(): Promise<BookingSettings> {
      const { data, error } = await client
        .from("settings")
        .select("value")
        .eq("key", "booking_settings")
        .maybeSingle();
      if (error || !data?.value || typeof data.value !== "object") return {};
      const value = data.value as Record<string, unknown>;
      return {
        minStay: numberOr(value.min_stay, 0) || undefined,
        maxStay: numberOr(value.max_stay, 0) || undefined,
        includedAdults: numberOr(value.included_adults, 2),
        extraAdultFee: numberOr(value.extra_adult_fee, 0),
        extraChildFee: numberOr(value.extra_child_fee, 0),
        closedDates: Array.isArray(value.closed_dates) ? (value.closed_dates as BookingSettings["closedDates"]) : [],
      };
    },

    async hasActiveOverlap(roomId, checkIn, checkOut) {
      const { count, error } = await client
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed", "blocked"])
        .lt("check_in", checkOut)
        .gt("check_out", checkIn);
      if (error) throw error;
      return (count ?? 0) > 0;
    },

    async createAuthoritatively(input: AuthoritativeCreateInput) {
      const { data, error } = await client.rpc("create_reservation_authoritatively", {
        p_reference: input.reference,
        p_guest_name: input.guestName,
        p_guest_email: input.guestEmail,
        p_guest_phone: input.guestPhone ?? null,
        p_guest_count: input.guestCount,
        p_room_id: input.roomId,
        p_check_in: input.checkIn,
        p_check_out: input.checkOut,
        p_total_amount: input.totalAmount,
        p_paid_amount: 0,
        p_status: "pending",
        p_special_requests: input.specialRequests ?? null,
        p_admin_notes: null,
        p_source: "direct",
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        id: String(row.id),
        reference: row.reference,
        totalAmount: numberOr(row.total_amount, input.totalAmount),
        status: row.status,
      };
    },

    makeReference() {
      return `RES-${Date.now().toString(36).toUpperCase()}${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    },
  };
}
