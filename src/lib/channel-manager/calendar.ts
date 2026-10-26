export type CalendarReservationRow = {
  id: string; reference: string; guest_name: string; room_id: string | null; check_in: string; check_out: string;
  status: string; source: string; channel_id: string | null;
  rooms?: { name: string } | Array<{ name: string }> | null;
  booking_channels?: { name: string; provider: string } | Array<{ name: string; provider: string }> | null;
};

export type CalendarItem = {
  id: string; reference: string; guestName: string; roomId: string | null; roomName: string;
  checkIn: string; checkOut: string; status: string; source: string; channelId: string | null; channelName: string | null;
};

const one = <T>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export function projectCalendarRows(rows: CalendarReservationRow[]): CalendarItem[] {
  return rows.map((row) => {
    const room = one(row.rooms);
    const channel = one(row.booking_channels);
    return {
      id: row.id, reference: row.reference, guestName: row.source === 'direct' ? row.guest_name : 'Disponibilité externe',
      roomId: row.room_id, roomName: room?.name ?? 'Chambre supprimée', checkIn: row.check_in, checkOut: row.check_out,
      status: row.status, source: row.source, channelId: row.channel_id, channelName: channel?.name ?? null,
    };
  });
}

export function overlapsRange(checkIn: string, checkOut: string, from: string, toExclusive: string) {
  return checkIn < toExclusive && checkOut > from;
}

export const sourceLabel = (source: string) => ({ direct: 'Direct', airbnb: 'Airbnb', booking: 'Booking.com', expedia: 'Expedia', vrbo: 'Vrbo', tripadvisor: 'Tripadvisor', custom: 'iCal' })[source] ?? source;

export function calendarMonthBounds(year: number, zeroBasedMonth: number) {
  const date = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return { from: date(new Date(year, zeroBasedMonth, 1)), to: date(new Date(year, zeroBasedMonth + 1, 1)) };
}
