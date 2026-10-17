import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseICalendar } from "./parser.ts";

test("parses folded Unicode all-day events with stable revisions", () => {
  const text = readFileSync(path.join(import.meta.dirname, "fixtures", "unicode-folded.ics"), "utf8");
  const [event] = parseICalendar(text, { source: "airbnb" });
  assert.equal(event.uid, "séjour-001@example.test");
  assert.equal(event.checkIn, "2035-07-01");
  assert.equal(event.checkOut, "2035-07-04");
  assert.equal(event.sequence, 2);
  assert.equal(event.summary, "Réservation très longueet pliée");
  assert.match(event.revision, /^[a-f0-9]{64}$/);
});

test("normalizes timestamp events and cancellation without guest metadata", () => {
  const [event] = parseICalendar(
    "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:event-2\r\nDTSTART:20350810T150000Z\r\nDTEND:20350812T100000Z\r\nSTATUS:CANCELLED\r\nDESCRIPTION:Guest email hidden@example.test\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n",
    { source: "booking" },
  );
  assert.equal(event.checkIn, "2035-08-10");
  assert.equal(event.checkOut, "2035-08-12");
  assert.equal(event.status, "cancelled");
  assert.equal("description" in event, false);
});

test("rejects malformed, duplicate and recurring events", () => {
  assert.throws(() => parseICalendar("BEGIN:VCALENDAR\nEND:VCALENDAR", { source: "custom" }), /no_events/);
  assert.throws(
    () =>
      parseICalendar(
        "BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:r1\nDTSTART;VALUE=DATE:20350101\nDTEND;VALUE=DATE:20350102\nRRULE:FREQ=DAILY\nEND:VEVENT\nEND:VCALENDAR",
        { source: "custom" },
      ),
    /unsupported_recurrence/,
  );
});
