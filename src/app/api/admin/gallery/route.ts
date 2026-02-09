import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Récupérer rooms et services séparément si nécessaire
    const items = await Promise.all((data || []).map(async (item: any) => {
      let room = null
      let service = null

      if (item.room_id) {
        const { data: roomData } = await supabase
          .from('rooms')
          .select('id, name')
          .eq('id', item.room_id)
          .single()
        room = roomData
      }

      if (item.service_id) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('id, name')
          .eq('id', item.service_id)
          .single()
        service = serviceData
      }

      return {
        ...item,
        url: item.image_url,
        room,
        service
      }
    }))

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, category, featured, url, room_id, service_id } = body

    if (!title || !url) {
      return NextResponse.json({ error: 'Titre et URL requis' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('gallery')
      .insert([{ 
        title, 
        category, 
        featured: featured || false, 
        image_url: url,
        room_id: room_id || null,
        service_id: service_id || null
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ...data, url: data.image_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
