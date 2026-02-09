import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const filename = `logo-${Date.now()}-${file.name}`
    const filepath = `logos/${filename}`

    const supabase = createAdminClient()

    // Essayer d'uploader dans le bucket 'public' puis fallback vers 'room-images' si introuvable
    const bucketsToTry = ['public', 'room-images']
    let uploadResult: any = null
    let usedBucket: string | null = null

    for (const bucket of bucketsToTry) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filepath, buffer, {
          contentType: file.type || undefined,
          upsert: true,
        })

      if (!error) {
        uploadResult = data
        usedBucket = bucket
        break
      }

      // Si l'erreur indique 'Bucket not found', on continue vers le fallback
      if (error && /Bucket not found/i.test(error.message || '')) {
        console.warn(`Bucket ${bucket} not found, trying next bucket`)
        continue
      }

      // Autre erreur -> abort
      console.error('Upload logo error:', error)
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
    }

    if (!uploadResult || !usedBucket) {
      return NextResponse.json({ error: 'Aucun bucket disponible pour l\'upload' }, { status: 500 })
    }

    const { data: publicData } = supabase.storage.from(usedBucket).getPublicUrl(filepath)
    return NextResponse.json({ publicUrl: publicData?.publicUrl })
  } catch (err: any) {
    console.error('Unexpected upload logo error:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
