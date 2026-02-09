import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, category, base_price, duration_minutes, is_active, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const services = (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? null,
      category: s.category,
      price: s.base_price != null ? Number(s.base_price) : 0,
      duration_minutes: s.duration_minutes ?? null,
      is_active: !!s.is_active,
      display_order: s.display_order ?? 0,
    }))

    return NextResponse.json({ services })
  } catch (err: any) {
    console.error('Error fetching services:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
