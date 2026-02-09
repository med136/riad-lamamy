import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, category, base_price, duration_minutes, is_active, display_order')
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

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const name: string | undefined = body?.name
    const category: string | undefined = body?.category
    const price: number | undefined = body?.price
    const description: string | undefined = body?.description
    const duration_minutes: number | null | undefined = body?.duration_minutes
    const is_active: boolean | undefined = body?.is_active
    const display_order: number | undefined = body?.display_order

    if (!name || !category || typeof price !== 'number') {
      return NextResponse.json({ error: 'name, category and price are required' }, { status: 400 })
    }

    const insertPayload: Record<string, any> = {
      name,
      category,
      base_price: price,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    }
    if (typeof description === 'string') insertPayload.description = description
    if (typeof duration_minutes === 'number' || duration_minutes === null) insertPayload.duration_minutes = duration_minutes
    if (typeof display_order === 'number') insertPayload.display_order = display_order

    const { data, error } = await supabase
      .from('services')
      .insert([insertPayload])
      .select('id, name, description, category, base_price, duration_minutes, is_active, display_order')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const service = {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      price: data.base_price != null ? Number(data.base_price) : 0,
      duration_minutes: data.duration_minutes ?? null,
      is_active: !!data.is_active,
      display_order: data.display_order ?? 0,
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (err: any) {
    console.error('Error creating service:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
