import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const loadEnvFromFile = (filename) => {
  const filePath = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const normalized = line.startsWith('export ') ? line.slice('export '.length).trim() : line
    const eqIndex = normalized.indexOf('=')
    if (eqIndex <= 0) continue

    const key = normalized.slice(0, eqIndex).trim()
    let value = normalized.slice(eqIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

// For local runs: `node` does not automatically load Next.js .env files.
loadEnvFromFile('.env.local')
loadEnvFromFile('.env')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Tip: ensure they exist in `.env.local` or export them in your shell before running the seed.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const args = new Set(process.argv.slice(2))
const force = args.has('--force')

const countRows = async (table) => {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`[${table}] count failed: ${error.message}`)
  return count || 0
}

const tryUploadToBuckets = async ({ buckets, path, bytes, contentType }) => {
  let lastError = null
  for (const bucket of buckets) {
    const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
      upsert: true,
      contentType,
      cacheControl: '3600',
    })

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { bucket, publicUrl: data?.publicUrl, path }
    }

    lastError = error
    const message = String(error?.message || '')
    if (/Bucket not found/i.test(message)) continue
    if (/not found/i.test(message) && /bucket/i.test(message)) continue
  }
  throw new Error(`Upload failed: ${lastError?.message || 'Unknown error'}`)
}

const svg = ({ title, subtitle, accent = '#d97706', bg1 = '#1f2937', bg2 = '#0f172a' }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg1}"/>
      <stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="25%" r="70%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <circle cx="420" cy="220" r="360" fill="url(#r)"/>
  <circle cx="1280" cy="140" r="260" fill="${accent}" opacity="0.18" filter="url(#blur)"/>
  <circle cx="1180" cy="720" r="340" fill="${accent}" opacity="0.12" filter="url(#blur)"/>
  <path d="M0,720 C220,640 420,760 640,720 C900,670 1060,560 1320,610 C1450,636 1540,720 1600,740 L1600,900 L0,900 Z" fill="#ffffff" opacity="0.06"/>
  <g fill="#ffffff">
    <text x="120" y="420" font-family="Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="18" letter-spacing="6" opacity="0.75">${subtitle}</text>
    <text x="120" y="500" font-family="Cormorant Garamond, Georgia, 'Times New Roman', serif" font-size="74" font-weight="700">${title}</text>
    <text x="120" y="560" font-family="Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="22" opacity="0.8">Demo image • Supabase Storage</text>
  </g>
  <g>
    <rect x="120" y="620" width="540" height="64" rx="32" fill="${accent}" opacity="0.9"/>
    <text x="152" y="662" font-family="Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="18" font-weight="700" fill="#111827">Riad — Collection Demo</text>
  </g>
</svg>`

const upsertSettings = async (pairs) => {
  const rows = pairs.map(([key, value]) => ({ key, value }))
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
  if (error) throw new Error(`[settings] upsert failed: ${error.message}`)
}

const ensureHero = async ({ backgroundUrl, carouselUrls }) => {
  const { data: existing, error: selError } = await supabase
    .from('hero_settings')
    .select('id')
    .limit(1)
    .maybeSingle()
  if (selError) throw new Error(`[hero_settings] select failed: ${selError.message}`)

  const payload = {
    title: "Riad Lamamy",
    subtitle: "Un havre de paix au coeur de Marrakech",
    background_image: backgroundUrl,
    cta_primary_text: "Réserver maintenant",
    cta_primary_link: "/reservations",
    cta_secondary_text: "Découvrir les chambres",
    cta_secondary_link: "/chambres",
    display_mode: "carousel",
  }

  let heroId = existing?.id || null
  if (!heroId) {
    let insert = await supabase.from('hero_settings').insert([payload]).select('id').single()
    if (insert.error && /column/i.test(insert.error.message || '')) {
      insert = await supabase
        .from('hero_settings')
        .insert([
          {
            title: payload.title,
            subtitle: payload.subtitle,
            background_image: payload.background_image,
            cta_primary_text: payload.cta_primary_text,
            cta_primary_link: payload.cta_primary_link,
            cta_secondary_text: payload.cta_secondary_text,
            cta_secondary_link: payload.cta_secondary_link,
          },
        ])
        .select('id')
        .single()
    }
    if (insert.error) throw new Error(`[hero_settings] insert failed: ${insert.error.message}`)
    heroId = insert.data?.id
  } else {
    const { error: updError } = await supabase.from('hero_settings').update(payload).eq('id', heroId)
    if (updError && /column/i.test(updError.message || '')) {
      const { error: fallbackError } = await supabase
        .from('hero_settings')
        .update({
          title: payload.title,
          subtitle: payload.subtitle,
          background_image: payload.background_image,
          cta_primary_text: payload.cta_primary_text,
          cta_primary_link: payload.cta_primary_link,
          cta_secondary_text: payload.cta_secondary_text,
          cta_secondary_link: payload.cta_secondary_link,
        })
        .eq('id', heroId)
      if (fallbackError) throw new Error(`[hero_settings] update failed: ${fallbackError.message}`)
    } else if (updError) {
      throw new Error(`[hero_settings] update failed: ${updError.message}`)
    }
  }

  if (!heroId) throw new Error('Hero settings id is missing after upsert')

  const { count: existingCarouselCount, error: carouselCountError } = await supabase
    .from('hero_carousel_images')
    .select('*', { count: 'exact', head: true })
    .eq('hero_settings_id', heroId)
  if (carouselCountError) throw new Error(`[hero_carousel_images] count failed: ${carouselCountError.message}`)

  if ((existingCarouselCount || 0) > 0 && !force) {
    console.log('Hero carousel already has images; skipping (use --force to overwrite demo carousel).')
    return
  }

  if (force) {
    const { error: delError } = await supabase
      .from('hero_carousel_images')
      .delete()
      .eq('hero_settings_id', heroId)
    if (delError) throw new Error(`[hero_carousel_images] delete failed: ${delError.message}`)
  }

  const rows = carouselUrls.map((image_url, idx) => ({
    hero_settings_id: heroId,
    image_url,
    display_order: idx + 1,
  }))

  const { error: insError } = await supabase.from('hero_carousel_images').insert(rows)
  if (insError) throw new Error(`[hero_carousel_images] insert failed: ${insError.message}`)
}

const seedServices = async () => {
  const count = await countRows('services')
  if (count > 0 && !force) {
    console.log('Services already exist; skipping (use --force to add demo services anyway).')
    return
  }

  if (force) {
    await supabase.from('services').delete().ilike('name', 'DEMO:%')
  }

  const demo = [
    {
      name: 'DEMO: Petit-déjeuner marocain',
      category: 'restauration',
      base_price: 0,
      duration_minutes: null,
      description: 'Petit-déjeuner traditionnel servi sur la terrasse ou dans votre chambre.',
      is_active: true,
      display_order: 1,
    },
    {
      name: 'DEMO: Transfert aéroport',
      category: 'transport',
      base_price: 25,
      duration_minutes: 45,
      description: 'Transfert privé depuis/vers l’aéroport de Marrakech.',
      is_active: true,
      display_order: 2,
    },
    {
      name: 'DEMO: Hammam & spa',
      category: 'spa',
      base_price: 35,
      duration_minutes: 60,
      description: 'Moment de détente avec hammam traditionnel et soins.',
      is_active: true,
      display_order: 3,
    },
    {
      name: 'DEMO: Excursion guidée',
      category: 'activite',
      base_price: 0,
      duration_minutes: null,
      description: 'Organisation d’excursions personnalisées (souks, Atlas, désert).',
      is_active: true,
      display_order: 4,
    },
    {
      name: 'DEMO: Dîner aux chandelles',
      category: 'restauration',
      base_price: 45,
      duration_minutes: 120,
      description: 'Dîner romantique avec spécialités marocaines.',
      is_active: true,
      display_order: 5,
    },
    {
      name: 'DEMO: Wi‑Fi haut débit',
      category: 'sur_mesure',
      base_price: 0,
      duration_minutes: null,
      description: 'Connexion internet gratuite dans tout le riad.',
      is_active: true,
      display_order: 6,
    },
  ]

  const { error } = await supabase.from('services').insert(demo)
  if (error) throw new Error(`[services] insert failed: ${error.message}`)
}

const safeInsertRooms = async (rooms) => {
  let result = await supabase.from('rooms').insert(rooms).select('id, name')
  if (result.error && /column/i.test(result.error.message || '')) {
    const minimal = rooms.map((r) => ({
      name: r.name,
      description: r.description ?? null,
      price: r.price,
      status: r.status ?? 'available',
    }))
    result = await supabase.from('rooms').insert(minimal).select('id, name')
  }
  if (result.error) throw new Error(`[rooms] insert failed: ${result.error.message}`)
  return result.data || []
}

const seedRoomsAndGallery = async ({ roomImageUrls, galleryUrls }) => {
  const roomCount = await countRows('rooms')
  const galleryCount = await countRows('gallery')

  let rooms = []
  if (roomCount === 0 || force) {
    if (force) {
      await supabase.from('rooms').delete().ilike('name', 'DEMO:%')
    }
    rooms = await safeInsertRooms([
      {
        name: 'DEMO: Suite Royale',
        description: "Notre suite la plus luxueuse avec une ambiance chaleureuse et raffinée.",
        price: 450,
        max_guests: 3,
        status: 'available',
      },
      {
        name: 'DEMO: Chambre Deluxe',
        description: 'Chambre spacieuse avec décoration marocaine authentique.',
        price: 280,
        max_guests: 2,
        status: 'available',
      },
      {
        name: 'DEMO: Chambre Standard',
        description: 'Chambre confortable, idéale pour une escapade au coeur de la médina.',
        price: 150,
        max_guests: 2,
        status: 'available',
      },
    ])
  } else {
    const { data } = await supabase.from('rooms').select('id, name').limit(3)
    rooms = data || []
  }

  if (galleryCount > 0 && !force) {
    console.log('Gallery already has items; skipping (use --force to add demo gallery items).')
    return
  }

  if (force) {
    await supabase.from('gallery').delete().ilike('title', 'DEMO:%')
  }

  const galleryRows = []

  // Room images (linked via room_id)
  for (let i = 0; i < Math.min(rooms.length, roomImageUrls.length); i += 1) {
    const room = rooms[i]
    galleryRows.push({
      title: `DEMO: ${room.name.replace(/^DEMO:\s*/, '')}`,
      category: 'chambres',
      featured: true,
      image_url: roomImageUrls[i],
      room_id: room.id,
      service_id: null,
    })
  }

  // General gallery items
  galleryUrls.forEach((url, idx) => {
    const category = idx % 2 === 0 ? 'architecture' : 'jardin'
    galleryRows.push({
      title: `DEMO: Galerie ${idx + 1}`,
      category,
      featured: idx < 4,
      image_url: url,
      room_id: null,
      service_id: null,
    })
  })

  const { error } = await supabase.from('gallery').insert(galleryRows)
  if (error) throw new Error(`[gallery] insert failed: ${error.message}`)
}

const seedTestimonials = async () => {
  const count = await countRows('testimonials')
  if (count > 0 && !force) {
    console.log('Testimonials already exist; skipping (use --force to add demo testimonials anyway).')
    return
  }

  if (force) {
    await supabase.from('testimonials').delete().ilike('guest_name', 'DEMO:%')
  }

  const rows = [
    {
      guest_name: 'DEMO: Sophie & Thomas',
      guest_country: 'Paris, France',
      rating: 5,
      content: "Séjour magique. Accueil chaleureux, chambres superbes et petit-déjeuner sur la terrasse inoubliable.",
      approved: true,
      featured: true,
    },
    {
      guest_name: 'DEMO: Maria R.',
      guest_country: 'Madrid, Espagne',
      rating: 5,
      content: "Service exceptionnel. L’équipe a rendu notre voyage de noces parfait.",
      approved: true,
      featured: false,
    },
    {
      guest_name: 'DEMO: James W.',
      guest_country: 'Londres, Royaume‑Uni',
      rating: 4,
      content: "Excellent rapport qualité-prix. Emplacement idéal pour explorer la médina.",
      approved: true,
      featured: false,
    },
    {
      guest_name: 'DEMO: Anna S.',
      guest_country: 'Berlin, Allemagne',
      rating: 5,
      content: "Une oasis de paix. Jardin magnifique, personnel aux petits soins.",
      approved: true,
      featured: false,
    },
  ]

  const { error } = await supabase.from('testimonials').insert(rows)
  if (error) throw new Error(`[testimonials] insert failed: ${error.message}`)
}

const main = async () => {
  console.log('Seeding demo homepage data…', force ? '(force)' : '')

  const logoUpload = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/branding/logo.svg',
    bytes: Buffer.from(svg({ title: 'Riad Lamamy', subtitle: 'LOGO', accent: '#111827', bg1: '#ffffff', bg2: '#f7f0e6' }), 'utf8'),
    contentType: 'image/svg+xml',
  })

  await upsertSettings([
    ['logo_text', 'Riad Lamamy'],
    ['site_tagline', "Riad boutique • Marrakech"],
    ['site_logo', logoUpload.publicUrl],
  ])

  const heroBg = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/hero/background.svg',
    bytes: Buffer.from(svg({ title: "Riad Lamamy", subtitle: 'MARRAKECH • DEMO', accent: '#d97706' }), 'utf8'),
    contentType: 'image/svg+xml',
  })

  const carousel1 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/hero/carousel-1.svg',
    bytes: Buffer.from(svg({ title: 'Patio & lumière', subtitle: 'CAROUSEL', accent: '#f59e0b', bg1: '#111827', bg2: '#0b1220' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const carousel2 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/hero/carousel-2.svg',
    bytes: Buffer.from(svg({ title: 'Suites élégantes', subtitle: 'CAROUSEL', accent: '#38bdf8', bg1: '#111827', bg2: '#0b1220' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const carousel3 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/hero/carousel-3.svg',
    bytes: Buffer.from(svg({ title: 'Terrasse au coucher', subtitle: 'CAROUSEL', accent: '#a78bfa', bg1: '#111827', bg2: '#0b1220' }), 'utf8'),
    contentType: 'image/svg+xml',
  })

  await ensureHero({
    backgroundUrl: heroBg.publicUrl,
    carouselUrls: [carousel1.publicUrl, carousel2.publicUrl, carousel3.publicUrl].filter(Boolean),
  })

  const room1 = await tryUploadToBuckets({
    buckets: ['room-images', 'public'],
    path: 'demo/rooms/room-1.svg',
    bytes: Buffer.from(svg({ title: 'Suite Royale', subtitle: 'CHAMBRES', accent: '#f59e0b', bg1: '#0f172a', bg2: '#111827' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const room2 = await tryUploadToBuckets({
    buckets: ['room-images', 'public'],
    path: 'demo/rooms/room-2.svg',
    bytes: Buffer.from(svg({ title: 'Chambre Deluxe', subtitle: 'CHAMBRES', accent: '#38bdf8', bg1: '#0f172a', bg2: '#111827' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const room3 = await tryUploadToBuckets({
    buckets: ['room-images', 'public'],
    path: 'demo/rooms/room-3.svg',
    bytes: Buffer.from(svg({ title: 'Chambre Standard', subtitle: 'CHAMBRES', accent: '#34d399', bg1: '#0f172a', bg2: '#111827' }), 'utf8'),
    contentType: 'image/svg+xml',
  })

  const g1 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/gallery/gallery-1.svg',
    bytes: Buffer.from(svg({ title: 'Architecture', subtitle: 'GALERIE', accent: '#f59e0b' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const g2 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/gallery/gallery-2.svg',
    bytes: Buffer.from(svg({ title: 'Vue rooftop', subtitle: 'GALERIE', accent: '#38bdf8' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const g3 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/gallery/gallery-3.svg',
    bytes: Buffer.from(svg({ title: 'Détails', subtitle: 'GALERIE', accent: '#a78bfa' }), 'utf8'),
    contentType: 'image/svg+xml',
  })
  const g4 = await tryUploadToBuckets({
    buckets: ['public', 'room-images'],
    path: 'demo/gallery/gallery-4.svg',
    bytes: Buffer.from(svg({ title: 'Ambiance', subtitle: 'GALERIE', accent: '#fb7185' }), 'utf8'),
    contentType: 'image/svg+xml',
  })

  await seedServices()
  await seedRoomsAndGallery({
    roomImageUrls: [room1.publicUrl, room2.publicUrl, room3.publicUrl].filter(Boolean),
    galleryUrls: [g1.publicUrl, g2.publicUrl, g3.publicUrl, g4.publicUrl].filter(Boolean),
  })
  await seedTestimonials()

  console.log('Done.')
  console.log('- Homepage services: /api/services')
  console.log('- Homepage gallery: /api/gallery')
  console.log('- Hero: /api/hero + /api/hero/carousel')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
