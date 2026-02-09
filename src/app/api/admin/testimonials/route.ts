import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { getCurrentUser } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const approved = url.searchParams.get('approved') // 'true' | 'false' | null
    const featured = url.searchParams.get('featured') // 'true' | 'false' | null
    const search = url.searchParams.get('search') || ''
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '50')

    const supabase = createAdminClient()
    let query = supabase.from('testimonials').select('*')

    if (approved === 'true') query = query.eq('approved', true)
    if (approved === 'false') query = query.eq('approved', false)
    if (featured === 'true') query = query.eq('featured', true)
    if (featured === 'false') query = query.eq('featured', false)

    if (search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(`guest_name.ilike.${term},content.ilike.${term}`)
    }

    query = query.order('created_at', { ascending: false })

    const offset = Math.max(0, (page - 1) * limit)
    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase testimonials error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, page, limit })
  } catch (e: any) {
    console.error('Admin Testimonials API GET error:', e)
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await req.json()
    const insertPayload = {
      guest_name: payload.guest_name ?? payload.name,
      guest_country: payload.guest_country ?? payload.country ?? null,
      rating: Number(payload.rating ?? 5),
      content: payload.content ?? payload.text,
      approved: !!payload.approved,
      featured: !!payload.featured,
    }

    if (!insertPayload.guest_name || !insertPayload.content) {
      return NextResponse.json({ error: 'guest_name and content are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('testimonials')
      .insert([insertPayload])
      .select('*')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('Admin Testimonials API POST error:', e)
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 })
  }
}
