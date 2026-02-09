import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const roomId = formData.get('roomId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const uploadedUrls: string[] = []

    // Télécharger chaque fichier
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const filename = `${roomId}-${Date.now()}-${file.name}`
      const filepath = `rooms/${filename}`

      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(filepath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      // Obtenir l'URL publique
      const { data: publicData } = supabase.storage
        .from('room-images')
        .getPublicUrl(filepath)

      if (publicData?.publicUrl) {
        uploadedUrls.push(publicData.publicUrl)
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'Erreur lors du téléchargement des images' }, { status: 500 })
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
