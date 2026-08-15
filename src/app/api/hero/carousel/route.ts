import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export const dynamic = 'force-dynamic'

type PublicHeroMediaRow = {
  id: string
  image_url: string | null
  media_type?: string | null
  media_url?: string | null
  poster_url?: string | null
  alt_text?: string | null
  display_order: number | null
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: heroSettings, error: heroError } = await supabase
      .from('hero_settings')
      .select('id')
      .limit(1)
      .single()

    if (heroError || !heroSettings) {
      return NextResponse.json({ items: [] })
    }

    const modernResult = await supabase
      .from('hero_carousel_images')
      .select('id, image_url, media_type, media_url, poster_url, alt_text, display_order, is_active')
      .eq('hero_settings_id', heroSettings.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    let data = modernResult.data as PublicHeroMediaRow[] | null
    let error = modernResult.error

    if (error) {
      const legacyResult = await supabase
        .from('hero_carousel_images')
        .select('id, image_url, display_order')
        .eq('hero_settings_id', heroSettings.id)
        .order('display_order', { ascending: true })
      data = legacyResult.data as PublicHeroMediaRow[] | null
      error = legacyResult.error
    }

    if (error) {
      console.error('Public hero carousel error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = ((data || []) as PublicHeroMediaRow[]).map((row) => ({
      id: row.id,
      media_type: row.media_type === 'video' ? 'video' : 'image',
      media_url: row.media_url || row.image_url,
      poster_url: row.poster_url ?? null,
      alt_text: row.alt_text ?? null,
      position: row.display_order ?? 0,
      is_active: true,
      image_url: row.media_url || row.image_url,
      display_order: row.display_order ?? 0,
    }))

    return NextResponse.json({ items })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
