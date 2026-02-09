import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const body = await req.json()
  
  // Mapper les champs du formulaire aux colonnes de la base de données
  const payload: any = {
    name: body.name,
    description: body.description ?? null,
    price: body.price,
    max_guests: body.capacity ?? body.max_guests,
    status: body.status,
    amenities: body.amenities,
    images: body.images
  }
  
  const { data, error } = await supabase.from('rooms').update(payload).eq('id', id).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('rooms').delete().eq('id', id).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
