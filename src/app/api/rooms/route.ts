import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

type RoomRow = {
  id: string
  name?: string | null
  description?: string | null
  price?: number | string | null
  base_price?: number | string | null
  max_capacity?: number | null
  max_guests?: number | null
  capacity?: number | null
  amenities?: unknown
  images?: unknown
}

const parseStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [value.trim()]
  } catch {
    return [value.trim()]
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Récupérer les chambres
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ rooms: [] })
    }

    // Pour chaque chambre, récupérer les images associées depuis la galerie
    const roomsWithImages = await Promise.all((data as RoomRow[]).map(async (room) => {
      const { data: images } = await supabase
        .from('gallery')
        .select('image_url')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true })

      const roomImages = parseStringList(room.images)
      const galleryImages = images?.map((image) => image.image_url).filter(Boolean) || []
      const amenities = parseStringList(room.amenities)

      return {
        id: room.id,
        name: room.name || 'Chambre',
        base_price: Number(room.price ?? room.base_price ?? 0),
        max_guests: room.max_capacity || room.max_guests || room.capacity || 2,
        description: room.description || '',
        amenities,
        images: Array.from(new Set([...roomImages, ...galleryImages])),
      }
    }))

    return NextResponse.json({ rooms: roomsWithImages })
  } catch (err: unknown) {
    console.error('Error fetching rooms:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}


