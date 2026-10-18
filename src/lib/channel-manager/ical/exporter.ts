import { createHash } from "node:crypto";

type ExportRoom = { id: number; name: string };
type ExportReservation = {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalAmount?: number;
  notes?: string;
};

const compactDate = (value: string) => value.replaceAll("-", "");
const opaqueUid = (roomId: number, reservationId: string) =>
  `${createHash("sha256").update(`${roomId}:${reservationId}`).digest("hex")}@darlamamy.local`;

export function buildAvailabilityCalendar(room: ExportRoom, reservations: ExportReservation[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//Dar LaMamy//Availability//EN",
    `X-WR-CALNAME:Dar LaMamy - ${room.name.replace(/[\r\n,;]/g, " ")}`,
  ];
  for (const reservation of reservations) {
    if (!["pending", "confirmed", "blocked"].includes(reservation.status)) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${opaqueUid(room.id, reservation.id)}`,
      `DTSTART;VALUE=DATE:${compactDate(reservation.checkIn)}`,
      `DTEND;VALUE=DATE:${compactDate(reservation.checkOut)}`,
      "SUMMARY:Unavailable",
      "TRANSP:OPAQUE",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
