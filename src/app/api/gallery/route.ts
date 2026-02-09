import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Math.max(1, Math.min(24, Number(url.searchParams.get('limit') || '8')))
    const category = (url.searchParams.get('category') || '').trim()
    const featuredParam = (url.searchParams.get('featured') || '').trim()

    const supabase = createAdminClient()

    const runPrimary = async () => {
      let query = supabase
        .from('gallery')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (category) query = query.eq('category', category)
      if (featuredParam === 'true') query = query.eq('featured', true)
      if (featuredParam === 'false') query = query.eq('featured', false)

      return query
    }

    const primary = await runPrimary()
    let data = primary.data as any[] | null
    let error = primary.error as any

    if (error && /column/i.test(error.message || '')) {
      // Fallback for schemas that don't have featured/created_at/description, etc.
      let fallbackQuery = supabase.from('gallery').select('id, title, category, image_url').limit(limit)
      if (category) fallbackQuery = fallbackQuery.eq('category', category)

      const fallback = await fallbackQuery
      data = fallback.data as any[] | null
      error = fallback.error as any
    }

    if (error) {
      console.error('Public gallery error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      image_url: row.image_url,
      featured: !!row.featured,
      created_at: row.created_at,
    }))

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
