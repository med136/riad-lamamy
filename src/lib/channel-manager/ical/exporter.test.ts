import assert from "node:assert/strict";
import test from "node:test";
import { buildAvailabilityCalendar } from "./exporter.ts";

test("exports opaque all-day blocks with CRLF framing and no sensitive fields", () => {
  const calendar = buildAvailabilityCalendar(
    { id: 4, name: "Suite Atlas" },
    [
      {
        id: "reservation-secret-id",
        checkIn: "2035-06-01",
        checkOut: "2035-06-03",
        status: "confirmed",
        guestName: "Private Guest",
        guestEmail: "private@example.test",
        guestPhone: "+212600000000",
        totalAmount: 900,
        notes: "private notes",
      },
    ],
  );
  assert.match(calendar, /^BEGIN:VCALENDAR\r\n/);
  assert.match(calendar, /DTSTART;VALUE=DATE:20350601\r\nDTEND;VALUE=DATE:20350603/);
  assert.match(calendar, /SUMMARY:Unavailable/);
  for (const secret of ["reservation-secret-id", "Private Guest", "private@example.test", "+212600000000", "900", "private notes"]) {
    assert.equal(calendar.includes(secret), false, secret);
  }
  assert.match(calendar, /\r\nEND:VCALENDAR\r\n$/);
});
