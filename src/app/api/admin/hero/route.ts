import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { requireAdminSession, UnauthorizedAdminError } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdminSession()
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('hero_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || {})
  } catch (err: unknown) {
    console.error('Error fetching hero settings:', err)
    const status = err instanceof UnauthorizedAdminError ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdminSession()
    const body = await req.json()
    const { 
      title, 
      subtitle, 
      background_image,
      cta_primary_text,
      cta_primary_link,
      cta_secondary_text,
      cta_secondary_link,
      display_mode,
    } = body

    const supabase = createAdminClient()
    
    // Récupérer l'ID existant
    const { data: existing } = await supabase
      .from('hero_settings')
      .select('id')
      .limit(1)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Hero settings not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('hero_settings')
      .update({
        title,
        subtitle,
        background_image,
        cta_primary_text,
        cta_primary_link,
        cta_secondary_text,
        cta_secondary_link,
        display_mode,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('Error updating hero settings:', err)
    const status = err instanceof UnauthorizedAdminError ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status })
  }
}
