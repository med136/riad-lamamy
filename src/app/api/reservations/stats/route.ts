import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'month' // day, week, month, year

    // Calculer les dates selon la période
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'month':
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    // Récupérer les réservations de la période
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('id, status, total_amount, paid_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculer les statistiques
    const stats = {
      total_reservations: reservations?.length || 0,
      total_revenue: 0,
      total_paid: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      average_reservation_value: 0
    }

    ;(reservations || []).forEach((res: any) => {
      stats.total_revenue += parseFloat(res.total_amount) || 0
      stats.total_paid += parseFloat(res.paid_amount) || 0

      switch (res.status) {
        case 'pending':
          stats.pending++
          break
        case 'confirmed':
          stats.confirmed++
          break
        case 'completed':
          stats.completed++
          break
        case 'cancelled':
          stats.cancelled++
          break
      }
    })

    if (stats.total_reservations > 0) {
      stats.average_reservation_value = stats.total_revenue / stats.total_reservations
    }

    return NextResponse.json({
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      ...stats
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
