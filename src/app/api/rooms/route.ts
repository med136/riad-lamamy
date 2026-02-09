import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Récupérer les chambres
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ rooms: [] })
    }

    // Pour chaque chambre, récupérer les images associées depuis la galerie
    const roomsWithImages = await Promise.all(data.map(async (room: any) => {
      const { data: images } = await supabase
        .from('gallery')
        .select('image_url')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true })

      return {
        id: room.id,
        name: room.name || 'Chambre',
        base_price: room.price ? parseFloat(room.price) : 100,
        max_guests: room.max_capacity || room.max_guests || room.capacity || 2,
        description: room.description || '',
        images: images?.map(img => img.image_url) || []
      }
    }))

    return NextResponse.json({ rooms: roomsWithImages })
  } catch (err: any) {
    console.error('Error fetching rooms:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}


