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

const calculateTotalPrice = (
  room: { base_price: number; seasonal_prices: SeasonalRule[] | Record<string, number> | null },
  checkInDate: Date,
  checkOutDate: Date,
  adultsCount: number,
  childrenCount: number,
  bookingSettings: BookingSettings
) => {
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
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
  const extraAdults = Math.max(0, adultsCount - includedAdults)
  totalPrice += extraAdults * extraAdultFee * nights
  totalPrice += childrenCount * extraChildFee * nights

  return Number(totalPrice.toFixed(2))
}

const sendEmail = async (payload: { to: string; subject: string; html: string; text?: string }) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()
    const url = new URL(req.url)

    const status = url.searchParams.get('status')
    const roomId = url.searchParams.get('room_id')
    const guestEmail = url.searchParams.get('guest_email')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)

    const offset = (page - 1) * limit

    let query = supabase
      .from('reservations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (roomId) query = query.eq('room_id', roomId)
    if (guestEmail) query = query.ilike('guest_email', `%${guestEmail}%`)

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reservations: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const {
      guest_name,
      guest_email,
      guest_phone,
      guest_count,
      room_id,
      check_in,
      check_out,
      total_amount,
      paid_amount = 0,
      status = 'pending',
      special_requests,
      admin_notes,
      adults_count,
      children_count,
      admin_override = false,
    } = body

    if (!guest_name || !guest_email || !room_id || !check_in || !check_out) {
      return NextResponse.json(
        { error: 'Missing required fields: guest_name, guest_email, room_id, check_in, check_out' },
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

    const bookingSettings = await getBookingSettings(supabase)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
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
      let dateCursor = new Date(check_in)
      while (dateCursor < checkOutDate) {
        const dateString = dateCursor.toISOString().split('T')[0]
        if (isDateClosed(dateString, bookingSettings.closed_dates)) {
          return NextResponse.json({ error: 'Dates are closed' }, { status: 400 })
        }
        dateCursor.setDate(dateCursor.getDate() + 1)
      }
    }

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, base_price, seasonal_prices, max_guests, status')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (room.status && room.status !== 'available') {
      return NextResponse.json({ error: 'Room not available' }, { status: 400 })
    }

    const totalGuests =
      typeof guest_count === 'number'
        ? guest_count
        : (Number(adults_count) || 0) + (Number(children_count) || 0)

    if (room.max_guests && totalGuests > room.max_guests) {
      return NextResponse.json({ error: 'Guest count exceeds room capacity' }, { status: 400 })
    }

    const { data: conflictingReservations, error: conflictError } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', room_id)
      .in('status', ['pending', 'confirmed'])
      .lt('check_in', check_out)
      .gt('check_out', check_in)

    if (conflictError) {
      return NextResponse.json({ error: conflictError.message }, { status: 500 })
    }
    if ((conflictingReservations || []).length > 0) {
      return NextResponse.json({ error: 'Room not available for selected dates' }, { status: 409 })
    }

    const resolvedAdults = Number(adults_count) || Math.max(1, totalGuests)
    const resolvedChildren = Number(children_count) || 0
    const computedTotal = calculateTotalPrice(
      room,
      checkInDate,
      checkOutDate,
      resolvedAdults,
      resolvedChildren,
      bookingSettings
    )

    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const reference = `RES-${timestamp}${random}`

    const payload = {
      reference,
      guest_name,
      guest_email,
      guest_phone: guest_phone || null,
      guest_count: totalGuests || 1,
      room_id,
      check_in,
      check_out,
      total_amount:
        admin_override && total_amount != null ? parseFloat(total_amount) : computedTotal,
      paid_amount: parseFloat(paid_amount),
      status,
      special_requests: special_requests || null,
      admin_notes: admin_notes || null,
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data?.guest_email) {
      const guestSubject = `Reservation confirmation ${data.reference}`
      const guestHtml = `
        <p>Hello ${data.guest_name},</p>
        <p>Your reservation request has been received.</p>
        <p><strong>Reference:</strong> ${data.reference}</p>
        <p><strong>Dates:</strong> ${data.check_in} to ${data.check_out}</p>
        <p><strong>Total:</strong> ${data.total_amount} MAD</p>
      `
      await sendEmail({ to: data.guest_email, subject: guestSubject, html: guestHtml })
    }

    const adminEmail = process.env.EMAIL_TO
    if (adminEmail) {
      const adminSubject = `New reservation ${data.reference}`
      const adminHtml = `
        <p>New reservation created.</p>
        <p><strong>Reference:</strong> ${data.reference}</p>
        <p><strong>Guest:</strong> ${data.guest_name} (${data.guest_email})</p>
        <p><strong>Dates:</strong> ${data.check_in} to ${data.check_out}</p>
        <p><strong>Total:</strong> ${data.total_amount} MAD</p>
      `
      await sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('Error creating reservation:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
