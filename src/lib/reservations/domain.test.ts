import assert from "node:assert/strict";
import test from "node:test";
import {
  createDirectReservation,
  quoteReservation,
  type ReservationDependencies,
} from "./domain.ts";
import { ReservationError } from "./errors.ts";

const room = {
  id: 7,
  name: "Suite Atlas",
  basePrice: 100,
  maxGuests: 4,
  status: "available" as const,
  seasonalPrices: [{ start: "2035-07-01", end: "2035-07-31", price: 150 }],
};

const dependencies = (overrides: Partial<ReservationDependencies> = {}): ReservationDependencies => ({
  getRoom: async () => room,
  getSettings: async () => ({
    minStay: 1,
    maxStay: 30,
    includedAdults: 2,
    extraAdultFee: 20,
    extraChildFee: 10,
    closedDates: [],
  }),
  hasActiveOverlap: async () => false,
  createAuthoritatively: async (input) => ({
    id: "reservation-id",
    reference: input.reference,
    totalAmount: input.totalAmount,
    status: "pending",
  }),
  makeReference: () => "RES-TEST",
  ...overrides,
});

const input = {
  roomId: 7,
  checkIn: "2035-07-01",
  checkOut: "2035-07-03",
  adults: 3,
  children: 1,
};

test("quotes seasonal nights and guest supplements from canonical room data", async () => {
  const quote = await quoteReservation(input, dependencies());

  assert.deepEqual(quote, {
    roomId: 7,
    roomName: "Suite Atlas",
    checkIn: "2035-07-01",
    checkOut: "2035-07-03",
    nights: 2,
    guests: 4,
    totalAmount: 360,
    currency: "MAD",
  });
});

test("rejects invalid dates, capacity, stay limits, closed dates, and overlaps", async () => {
  await assert.rejects(
    quoteReservation({ ...input, checkOut: input.checkIn }, dependencies()),
    (error: unknown) => error instanceof ReservationError && error.code === "invalid_dates",
  );
  await assert.rejects(
    quoteReservation({ ...input, adults: 4, children: 1 }, dependencies()),
    (error: unknown) => error instanceof ReservationError && error.code === "capacity_exceeded",
  );
  await assert.rejects(
    quoteReservation(
      { ...input, adults: 2, children: 0 },
      dependencies({ getSettings: async () => ({ minStay: 3 }) }),
    ),
    (error: unknown) => error instanceof ReservationError && error.code === "invalid_dates",
  );
  await assert.rejects(
    quoteReservation(
      { ...input, adults: 2, children: 0 },
      dependencies({ getSettings: async () => ({ closedDates: ["2035-07-02"] }) }),
    ),
    (error: unknown) => error instanceof ReservationError && error.code === "room_unavailable",
  );
  await assert.rejects(
    quoteReservation(
      { ...input, adults: 2, children: 0 },
      dependencies({ hasActiveOverlap: async () => true }),
    ),
    (error: unknown) => error instanceof ReservationError && error.code === "room_unavailable",
  );
});

test("maps the database overlap into availability_conflict", async () => {
  const deps = dependencies({
    createAuthoritatively: async () => {
      throw new Error("availability_conflict");
    },
  });

  await assert.rejects(
    createDirectReservation(
      {
        ...input,
        adults: 2,
        children: 0,
        guestName: "Test Guest",
        guestEmail: "guest@example.test",
      },
      deps,
    ),
    (error: unknown) =>
      error instanceof ReservationError &&
      error.code === "availability_conflict" &&
      error.httpStatus === 409,
  );
});
