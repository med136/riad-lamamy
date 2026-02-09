import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { getCurrentUser } from '@/lib/supabase/server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await req.json()
    const supabase = createAdminClient()

    const updatePayload: Record<string, any> = {}
    if (body.guest_name ?? body.name) updatePayload.guest_name = body.guest_name ?? body.name
    if (body.guest_country ?? body.country) updatePayload.guest_country = body.guest_country ?? body.country
    if (body.content ?? body.text) updatePayload.content = body.content ?? body.text
    if (body.rating !== undefined) updatePayload.rating = Number(body.rating)
    if (body.approved !== undefined) updatePayload.approved = !!body.approved
    if (body.featured !== undefined) updatePayload.featured = !!body.featured

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const numericId = Number(id)
    const matcher = Number.isFinite(numericId) ? numericId : id
    const { data, error } = await supabase
      .from('testimonials')
      .update(updatePayload)
      .eq('id', matcher)
      .select('*')
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('Admin Testimonials API PUT error:', e)
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const supabase = createAdminClient()

    const numericId = Number(id)
    const matcher = Number.isFinite(numericId) ? numericId : id
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', matcher)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Admin Testimonials API DELETE error:', e)
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 })
  }
}
