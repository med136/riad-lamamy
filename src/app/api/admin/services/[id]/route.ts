import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createAdminClient()
    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await req.json()

    // Allow updating a safe subset of fields
    const updates: Record<string, any> = {}
    if (typeof body.price === 'number') updates.base_price = body.price
    if (typeof body.duration_minutes === 'number' || body.duration_minutes === null) {
      updates.duration_minutes = body.duration_minutes
    }
    if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
    if (typeof body.description === 'string') updates.description = body.description

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select('id, name, description, category, base_price, duration_minutes, is_active, display_order')
      .single()

    if (error) {
      console.error('Supabase update error:', error)
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

    return NextResponse.json({ service })
  } catch (err: any) {
    console.error('Error updating service:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createAdminClient()
    const resolvedParams = await params
    const id = resolvedParams.id

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error deleting service:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
