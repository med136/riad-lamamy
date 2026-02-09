import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createAdminClient()
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, description, price, capacity, status, amenities = [], images = [], featured = false } = body

  if (!name || price == null) {
    return NextResponse.json({ error: 'Missing required fields: name and price are required' }, { status: 400 })
  }

  const priceNum = Number(price)
  if (Number.isNaN(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  const maxGuests = capacity != null ? Number(capacity) : null
  if (maxGuests != null && (!Number.isInteger(maxGuests) || maxGuests < 1)) {
    return NextResponse.json({ error: 'Invalid capacity (max_guests must be a positive integer)' }, { status: 400 })
  }

  // Generate slug from name (remove accents, lowercase, replace spaces with hyphens)
  const generateSlug = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const payload: any = {
    name,
    description: description ?? null,
    price: priceNum,
    max_guests: maxGuests ?? 2,
    status: status ?? 'available',
    amenities: Array.isArray(amenities) ? amenities : [],
    images: Array.isArray(images) ? images : []
  }

  // Nettoyer le payload pour ne garder que les colonnes existantes
  try {
    // Essayer d'abord avec le payload complet
    let insertResult = await supabase.from('rooms').insert([payload]).select().single()
    
    if (insertResult.error && insertResult.error.message?.includes('column')) {
      // Si erreur de colonne, essayer un payload minimal
      const minimalPayload = {
        name,
        description: description ?? null,
        price: priceNum,
        status: status ?? 'available'
      }
      insertResult = await supabase.from('rooms').insert([minimalPayload]).select().single()
    }
    
    const { data, error } = insertResult
    
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('Unexpected error inserting room:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
