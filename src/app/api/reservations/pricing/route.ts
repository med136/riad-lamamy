import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

type BookingSettings = {
  min_stay?: number
  max_stay?: number
  included_adults?: number
  extra_adult_fee?: number
  extra_child_fee?: number
  closed_dates?: Array<string | { start: string; end?: string }>
}

type SeasonalRule = {
  start: string
  end: string
  price: number
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

const resolveSeasonalPrice = (
  date: Date,
  seasonalPrices: SeasonalRule[] | Record<string, number> | null,
  basePrice: number
) => {
  if (!seasonalPrices) return basePrice

  if (Array.isArray(seasonalPrices)) {
    for (const rule of seasonalPrices) {
      const start = new Date(rule.start)
      const end = new Date(rule.end)
      if (date >= start && date <= end) {
        return Number(rule.price) || basePrice
      }
    }
    return basePrice
  }

  if (typeof seasonalPrices === 'object') {
    const key = date.toISOString().split('T')[0]
    const match = seasonalPrices[key]
    return typeof match === 'number' ? match : basePrice
  }

  return basePrice
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const { room_id, check_in, check_out, adults_count, children_count } = body

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

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, base_price, seasonal_prices')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (nights <= 0) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    const bookingSettings = await getBookingSettings(supabase)
    if (bookingSettings.min_stay && nights < bookingSettings.min_stay) {
      return NextResponse.json(
        { error: `Minimum stay is ${bookingSettings.min_stay} nights` },
        { status: 400 }
      )
    }
    if (bookingSettings.max_stay && nights > bookingSettings.max_stay) {
      return NextResponse.json(
        { error: `Maximum stay is ${bookingSettings.max_stay} nights` },
        { status: 400 }
      )
    }

    if (bookingSettings.closed_dates) {
      let dateCursor = new Date(checkInDate)
      while (dateCursor < checkOutDate) {
        const dateString = dateCursor.toISOString().split('T')[0]
        if (isDateClosed(dateString, bookingSettings.closed_dates)) {
          return NextResponse.json({ error: 'Dates are closed' }, { status: 400 })
        }
        dateCursor.setDate(dateCursor.getDate() + 1)
      }
    }

    const basePrice = Number(room.base_price) || 0
    let totalPrice = 0
    let dateCursor = new Date(checkInDate)

    for (let i = 0; i < nights; i += 1) {
      totalPrice += resolveSeasonalPrice(dateCursor, room.seasonal_prices, basePrice)
      dateCursor.setDate(dateCursor.getDate() + 1)
    }

    const includedAdults = bookingSettings.included_adults ?? 2
    const extraAdultFee = bookingSettings.extra_adult_fee ?? 0
    const extraChildFee = bookingSettings.extra_child_fee ?? 0
    const adults = Number(adults_count) || 0
    const children = Number(children_count) || 0
    const extraAdults = Math.max(0, adults - includedAdults)
    totalPrice += extraAdults * extraAdultFee * nights
    totalPrice += children * extraChildFee * nights

    return NextResponse.json({
      room_id: room.id,
      room_name: room.name,
      check_in,
      check_out,
      nights,
      base_price: basePrice,
      total_price: Number(totalPrice.toFixed(2)),
      currency: 'MAD',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
