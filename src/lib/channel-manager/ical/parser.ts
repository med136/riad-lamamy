import { calendarRevision } from "./revision.ts";

export type ParsedCalendarEvent = {
  uid: string;
  checkIn: string;
  checkOut: string;
  status: "active" | "cancelled";
  sequence: number;
  revision: string;
  summary: string | null;
  source: string;
};

const unescapeText = (value: string) =>
  value.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");

const normalizeDate = (value: string) => {
  const compact = value.trim();
  if (!/^\d{8}(T\d{6}Z?)?$/.test(compact)) throw new Error("invalid_event_date");
  const date = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("invalid_event_date");
  }
  return date;
};

export function parseICalendar(
  text: string,
  options: { source: string; maxEvents?: number },
): ParsedCalendarEvent[] {
  if (Buffer.byteLength(text, "utf8") > 1_048_576) throw new Error("calendar_too_large");
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events: Array<Record<string, string>> = [];
  let current: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      if (current) throw new Error("nested_event");
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (!current) throw new Error("unexpected_event_end");
      events.push(current);
      if (events.length > (options.maxEvents ?? 2_000)) throw new Error("too_many_events");
      current = null;
      continue;
    }
    if (!current) continue;
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).split(";", 1)[0].toUpperCase();
    current[key] = line.slice(separator + 1);
  }
  if (current) throw new Error("unterminated_event");
  if (events.length === 0) throw new Error("no_events");

  const byUid = new Map<string, ParsedCalendarEvent>();
  for (const raw of events) {
    if (raw.RRULE || raw.RDATE || raw.EXDATE) throw new Error("unsupported_recurrence");
    const uid = raw.UID?.trim();
    if (!uid || !raw.DTSTART || !raw.DTEND) throw new Error("malformed_event");
    const checkIn = normalizeDate(raw.DTSTART);
    const checkOut = normalizeDate(raw.DTEND);
    if (checkOut <= checkIn) throw new Error("invalid_event_dates");
    const sequence = Number.parseInt(raw.SEQUENCE ?? "0", 10);
    const status = raw.STATUS?.toUpperCase() === "CANCELLED" ? "cancelled" : "active";
    const summary = raw.SUMMARY ? unescapeText(raw.SUMMARY) : null;
    const event: ParsedCalendarEvent = {
      uid,
      checkIn,
      checkOut,
      status,
      sequence: Number.isFinite(sequence) ? sequence : 0,
      revision: calendarRevision([uid, checkIn, checkOut, status, sequence, raw.LAST_MODIFIED, raw.DTSTAMP]),
      summary,
      source: options.source,
    };
    const existing = byUid.get(uid);
    if (!existing || event.sequence >= existing.sequence) byUid.set(uid, event);
  }
  return [...byUid.values()];
}
