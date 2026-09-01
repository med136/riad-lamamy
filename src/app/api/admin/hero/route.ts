import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { requireAdminSession, UnauthorizedAdminError } from '@/lib/auth/admin'
import { isLocalHeroMediaUrl } from '@/lib/hero-local-storage'

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
      is_active,
    } = body

    const supabase = createAdminClient()

    // Récupérer l'enregistrement existant pour autoriser une ancienne URL uniquement si elle reste inchangée.
    const { data: existing } = await supabase
      .from('hero_settings')
      .select('id, background_image')
      .limit(1)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Hero settings not found' }, { status: 404 })
    }

    const isBundledImage = typeof background_image === 'string' && background_image.startsWith('/images/')
    const unchangedLegacyBackground = background_image === existing.background_image
    if (
      typeof background_image !== 'string' ||
      (!isLocalHeroMediaUrl(background_image) && !isBundledImage && !unchangedLegacyBackground)
    ) {
      return NextResponse.json(
        { error: 'La nouvelle image de fond du Hero doit provenir du stockage local du serveur.' },
        { status: 400 },
      )
    }

    const updatePayload = {
      title,
      subtitle,
      background_image,
      cta_primary_text,
      cta_primary_link,
      cta_secondary_text,
      cta_secondary_link,
      display_mode,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    }

    let result = await supabase
      .from('hero_settings')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .single()

    if (result.error?.code === '42703') {
      const { is_active: _isActive, ...legacyPayload } = updatePayload
      result = await supabase
        .from('hero_settings')
        .update(legacyPayload)
        .eq('id', existing.id)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Update error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (err: unknown) {
    console.error('Error updating hero settings:', err)
    const status = err instanceof UnauthorizedAdminError ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status })
  }
}
