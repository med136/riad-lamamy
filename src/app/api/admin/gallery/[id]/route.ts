import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 })
    }

    // Récupérer room et service séparément si nécessaire
    let room = null
    let service = null

    if (data.room_id) {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('id', data.room_id)
        .single()
      room = roomData
    }

    if (data.service_id) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, name')
        .eq('id', data.service_id)
        .single()
      service = serviceData
    }

    return NextResponse.json({ ...data, url: data.image_url, room, service })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, category, featured, url, room_id, service_id } = body

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('gallery')
      .update({ 
        title, 
        category, 
        featured: featured || false, 
        image_url: url,
        room_id: room_id || null,
        service_id: service_id || null
      })
      .eq('id', id)
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Image supprimée' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
