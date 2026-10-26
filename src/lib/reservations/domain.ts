import { isAvailabilityConflict, ReservationError } from "./errors.ts";
import type { RoomIdentifier } from "./room-identifier.ts";

export type SeasonalPrice = { start: string; end: string; price: number };
export type ClosedDate = string | { start: string; end?: string };

export type ReservationRoom = {
  id: RoomIdentifier;
  name: string;
  basePrice: number;
  maxGuests: number;
  status: string;
  seasonalPrices: SeasonalPrice[] | Record<string, number> | null;
};

export type BookingSettings = {
  minStay?: number;
  maxStay?: number;
  includedAdults?: number;
  extraAdultFee?: number;
  extraChildFee?: number;
  closedDates?: ClosedDate[];
};

export type QuoteInput = {
  roomId: RoomIdentifier;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
};

export type ReservationQuote = {
  roomId: RoomIdentifier;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  currency: "MAD";
};

export type DirectReservationInput = QuoteInput & {
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  specialRequests?: string | null;
};

export type ReservationResult = {
  id: string;
  reference: string;
  totalAmount: number;
  status: string;
  quote: ReservationQuote;
};

export type AuthoritativeCreateInput = DirectReservationInput & {
  reference: string;
  guestCount: number;
  totalAmount: number;
};

export type ReservationDependencies = {
  getRoom(roomId: RoomIdentifier): Promise<ReservationRoom | null>;
  getSettings(): Promise<BookingSettings>;
  hasActiveOverlap(roomId: RoomIdentifier, checkIn: string, checkOut: string): Promise<boolean>;
  createAuthoritatively(input: AuthoritativeCreateInput): Promise<{
    id: string;
    reference: string;
    totalAmount: number;
    status: string;
  }>;
  makeReference(): string;
};

const DAY_MS = 86_400_000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (value: string) => {
  if (!datePattern.test(value)) throw new ReservationError("invalid_dates");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ReservationError("invalid_dates");
  }
  return date;
};

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

const isClosed = (key: string, closedDates: ClosedDate[] = []) =>
  closedDates.some((entry) => {
    if (typeof entry === "string") return entry === key;
    return key >= entry.start && key <= (entry.end ?? entry.start);
  });

const nightlyPrice = (
  key: string,
  seasonalPrices: ReservationRoom["seasonalPrices"],
  basePrice: number,
) => {
  if (Array.isArray(seasonalPrices)) {
    const rule = seasonalPrices.find((candidate) => key >= candidate.start && key <= candidate.end);
    return rule ? Number(rule.price) : basePrice;
  }
  if (seasonalPrices && typeof seasonalPrices === "object") {
    return Number(seasonalPrices[key] ?? basePrice);
  }
  return basePrice;
};

export async function quoteReservation(
  input: QuoteInput,
  deps: ReservationDependencies,
): Promise<ReservationQuote> {
  const checkIn = parseDate(input.checkIn);
  const checkOut = parseDate(input.checkOut);
  const nights = (checkOut.getTime() - checkIn.getTime()) / DAY_MS;
  if (!Number.isInteger(nights) || nights <= 0) throw new ReservationError("invalid_dates");

  const [room, settings] = await Promise.all([deps.getRoom(input.roomId), deps.getSettings()]);
  if (!room) throw new ReservationError("room_not_found");
  if (room.status !== "available") throw new ReservationError("room_unavailable");

  const adults = Number(input.adults);
  const children = Number(input.children);
  const guests = adults + children;
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 1 || children < 0) {
    throw new ReservationError("capacity_exceeded");
  }
  if (guests > room.maxGuests) throw new ReservationError("capacity_exceeded");
  if ((settings.minStay && nights < settings.minStay) || (settings.maxStay && nights > settings.maxStay)) {
    throw new ReservationError("invalid_dates");
  }

  let total = 0;
  for (let index = 0; index < nights; index += 1) {
    const key = dateKey(new Date(checkIn.getTime() + index * DAY_MS));
    if (isClosed(key, settings.closedDates)) throw new ReservationError("room_unavailable");
    total += nightlyPrice(key, room.seasonalPrices, room.basePrice);
  }

  if (await deps.hasActiveOverlap(room.id, input.checkIn, input.checkOut)) {
    throw new ReservationError("room_unavailable");
  }

  total += Math.max(0, adults - (settings.includedAdults ?? 2)) * (settings.extraAdultFee ?? 0) * nights;
  total += children * (settings.extraChildFee ?? 0) * nights;

  return {
    roomId: room.id,
    roomName: room.name,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    guests,
    totalAmount: Number(total.toFixed(2)),
    currency: "MAD",
  };
}

export async function createDirectReservation(
  input: DirectReservationInput,
  deps: ReservationDependencies,
): Promise<ReservationResult> {
  const quote = await quoteReservation(input, deps);
  try {
    const created = await deps.createAuthoritatively({
      ...input,
      reference: deps.makeReference(),
      guestCount: quote.guests,
      totalAmount: quote.totalAmount,
    });
    return { ...created, quote };
  } catch (error) {
    if (isAvailabilityConflict(error)) throw new ReservationError("availability_conflict");
    throw error;
  }
}
