import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const fileExt = (file.name.split('.').pop() || '').toLowerCase()
    const safeExt = fileExt && fileExt.length <= 8 ? fileExt : 'png'
    const fileName = `admin-logo-${Date.now()}.${safeExt}`
    const filepath = `admin-logos/${fileName}`

    // Prefer public buckets so the stored URL works everywhere (preview, sidebar, etc.).
    const bucketsToTry = ['public', 'room-images', 'admin-logos']
    let usedBucket: string | null = null
    let usedPath: string | null = null

    for (const bucket of bucketsToTry) {
      const objectPath = bucket === 'admin-logos' ? fileName : filepath
      const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600',
      })

      if (!error) {
        usedBucket = bucket
        usedPath = objectPath
        break
      }

      if (error && /Bucket not found/i.test(error.message || '')) {
        continue
      }

      console.error('Erreur upload Supabase:', error)
      return NextResponse.json({ error: error.message || "Erreur lors de l'upload" }, { status: 500 })
    }

    if (!usedBucket) {
      return NextResponse.json({ error: "Aucun bucket disponible pour l'upload" }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(usedBucket).getPublicUrl(usedPath || filepath)

    return NextResponse.json({
      publicUrl: urlData.publicUrl,
      bucket: usedBucket,
      path: usedPath || filepath,
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
