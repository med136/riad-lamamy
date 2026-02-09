import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export const dynamic = 'force-dynamic'

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

    const { data, error } = await supabase
      .from('hero_carousel_images')
      .select('id, image_url, display_order')
      .eq('hero_settings_id', heroSettings.id)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Public hero carousel error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (data || []).map((row: any) => ({
      id: row.id,
      image_url: row.image_url,
      display_order: row.display_order ?? 0,
    }))

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}

