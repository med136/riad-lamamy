import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Users count (profiles table)
    const { count: usersCount, error: uErr } = await supabase.from('profiles').select('id', { count: 'exact' })
    if (uErr) throw uErr

    // Rooms total and occupied
    const { count: roomsTotal, error: rErr } = await supabase.from('rooms').select('id', { count: 'exact' })
    if (rErr) throw rErr
    const { count: roomsOccupied, error: roErr } = await supabase.from('rooms').select('id', { count: 'exact' }).eq('status', 'occupied')
    if (roErr) throw roErr

    // Bookings this month and revenue
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

    const { data: bookingsThisMonthData, error: bErr } = await supabase.from('bookings')
      .select('total_price')
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)
    if (bErr) throw bErr

    const bookingsThisMonth = (bookingsThisMonthData || []).length
    const revenueThisMonth = (bookingsThisMonthData || []).reduce((acc: number, b: any) => acc + Number(b.total_price || 0), 0)

    // Average rating from reviews (overall_rating)
    const { data: ratingsData, error: rvErr } = await supabase.from('reviews').select('overall_rating')
    if (rvErr) throw rvErr
    const ratingValues = (ratingsData || []).map((r: any) => Number(r.overall_rating || 0)).filter((v: number) => !Number.isNaN(v))
    const avgRating = ratingValues.length ? (ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length) : null

    // Recent reservations (last 5)
    const { data: recentReservations, error: rrErr } = await supabase.from('reservations')
      .select('id, guest_name, room_id, check_in, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (rrErr) throw rrErr

    return NextResponse.json({
      usersCount: usersCount || 0,
      roomsTotal: roomsTotal || 0,
      roomsOccupied: roomsOccupied || 0,
      bookingsThisMonth,
      revenueThisMonth,
      avgRating,
      recentReservations: recentReservations || []
    })
  } catch (err: any) {
    console.error('Error fetching admin stats:', err)
    return NextResponse.json({ error: err?.message || 'Error fetching stats' }, { status: 500 })
  }
}