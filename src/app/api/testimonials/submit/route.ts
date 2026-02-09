import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const rate = checkRateLimit(`testimonial:${ip}`, 3, 60 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'rate_limit' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      )
    }

    const body = await req.json()
    const name = (body.name || body.guest_name || '').trim()
    const country = (body.country || body.guest_country || '').trim()
    const content = (body.content || '').trim()
    const rating = Number(body.rating ?? 5)
    const consent = Boolean(body.consent)
    const company = String(body.company || '').trim()

    if (company) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (!name || name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'invalid_name' }, { status: 400 })
    }
    if (!content || content.length < 20 || content.length > 2000) {
      return NextResponse.json({ error: 'invalid_content' }, { status: 400 })
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'invalid_rating' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'invalid_consent' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        {
          guest_name: name,
          guest_country: country || null,
          content,
          rating,
          approved: false,
          featured: false,
        },
      ])
      .select('*')
      .single()

    if (error) {
      console.error('Supabase insert testimonial error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { ok: true, data },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    console.error('Public Testimonials submit error:', e)
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 })
  }
}
