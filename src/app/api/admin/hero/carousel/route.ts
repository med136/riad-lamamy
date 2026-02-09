import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Récupérer toutes les images du carrousel
export async function GET() {
  try {
    // Récupérer d'abord les paramètres hero
    const { data: heroSettings, error: heroError } = await supabase
      .from('hero_settings')
      .select('id')
      .limit(1)
      .single()

    if (heroError || !heroSettings) {
      return NextResponse.json(
        { error: 'Hero settings not found' },
        { status: 404 }
      )
    }

    // Récupérer les images du carrousel triées par order
    const { data: images, error } = await supabase
      .from('hero_carousel_images')
      .select('*')
      .eq('hero_settings_id', heroSettings.id)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(images || [])
  } catch (err: any) {
    console.error('Carousel GET error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Ajouter une image au carrousel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image_url } = body

    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Récupérer d'abord les paramètres hero
    const { data: heroSettings, error: heroError } = await supabase
      .from('hero_settings')
      .select('id')
      .limit(1)
      .single()

    if (heroError || !heroSettings) {
      return NextResponse.json(
        { error: 'Hero settings not found' },
        { status: 404 }
      )
    }

    // Compter les images existantes pour définir l'ordre
    const { count, error: countError } = await supabase
      .from('hero_carousel_images')
      .select('*', { count: 'exact', head: true })
      .eq('hero_settings_id', heroSettings.id)

    const nextOrder = (count || 0) + 1

    // Ajouter la nouvelle image
    const { data, error } = await supabase
      .from('hero_carousel_images')
      .insert([{
        hero_settings_id: heroSettings.id,
        image_url,
        display_order: nextOrder
      }])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (err: any) {
    console.error('Carousel POST error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour l'ordre des images
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { images } = body

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images array is required' },
        { status: 400 }
      )
    }

    // Mettre à jour l'ordre de chaque image
    const updates = images.map((image, index) => ({
      id: image.id,
      display_order: index + 1
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from('hero_carousel_images')
        .update({ display_order: update.display_order })
        .eq('id', update.id)

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Carousel PUT error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
