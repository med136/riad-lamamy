import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

type BookingSettings = {
  min_stay?: number
  max_stay?: number
  closed_dates?: Array<string | { start: string; end?: string }>
}

const getBookingSettings = async (supabase: ReturnType<typeof createAdminClient>) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'booking_settings')
    .single()

  if (error || !data?.value) return {}
  return data.value as BookingSettings
}

const isDateClosed = (date: string, closedDates: BookingSettings['closed_dates']) => {
  if (!closedDates || closedDates.length === 0) return false
  const target = new Date(date)
  for (const entry of closedDates) {
    if (typeof entry === 'string') {
      if (entry === date) return true
      continue
    }
    const start = new Date(entry.start)
    const end = new Date(entry.end ?? entry.start)
    if (target >= start && target <= end) return true
  }
  return false
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const { room_id, check_in, check_out, guest_count, adults_count, children_count } = body

    if (!room_id || !check_in || !check_out) {
      return NextResponse.json(
        { error: 'Missing required fields: room_id, check_in, check_out' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const bookingSettings = await getBookingSettings(supabase)

    if (bookingSettings.min_stay && nights < bookingSettings.min_stay) {
      return NextResponse.json({
        available: false,
        reason: 'min_stay',
        message: `Minimum stay is ${bookingSettings.min_stay} nights`,
      })
    }
    if (bookingSettings.max_stay && nights > bookingSettings.max_stay) {
      return NextResponse.json({
        available: false,
        reason: 'max_stay',
        message: `Maximum stay is ${bookingSettings.max_stay} nights`,
      })
    }

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, status, max_guests')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (room.status && room.status !== 'available') {
      return NextResponse.json({
        available: false,
        reason: 'room_unavailable',
        message: 'Room is not available',
      })
    }

    const totalGuests =
      typeof guest_count === 'number'
        ? guest_count
        : (parseInt(adults_count ?? '0', 10) || 0) + (parseInt(children_count ?? '0', 10) || 0)

    if (room.max_guests && totalGuests > room.max_guests) {
      return NextResponse.json({
        available: false,
        reason: 'capacity',
        message: 'Guest count exceeds room capacity',
      })
    }

    if (bookingSettings.closed_dates) {
      let dateCursor = new Date(check_in)
      while (dateCursor < checkOutDate) {
        const dateString = dateCursor.toISOString().split('T')[0]
        if (isDateClosed(dateString, bookingSettings.closed_dates)) {
          return NextResponse.json({
            available: false,
            reason: 'closed_dates',
            message: 'Dates are closed',
          })
        }
        dateCursor.setDate(dateCursor.getDate() + 1)
      }
    }

    const { data: conflictingReservations, error } = await supabase
      .from('reservations')
      .select('id, reference, check_in, check_out, status')
      .eq('room_id', room_id)
      .in('status', ['pending', 'confirmed'])
      .lt('check_in', check_out)
      .gt('check_out', check_in)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const conflicts = conflictingReservations || []
    const isAvailable = conflicts.length === 0

    return NextResponse.json({
      available: isAvailable,
      conflictingReservations: conflicts,
      message: isAvailable
        ? 'Room is available for the selected dates'
        : 'Room is not available for the selected dates',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
