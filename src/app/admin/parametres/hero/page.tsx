'use client'
/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */

import { useState, useEffect } from 'react'
import { Upload, Save, Eye, RotateCcw, Trash2, GripVertical, ImageIcon, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  HERO_IMAGE_MAX_BYTES,
  HERO_IMAGE_MIME_TYPES,
  HERO_MEDIA_ACCEPT,
  HERO_VIDEO_MAX_BYTES,
  HERO_VIDEO_MIME_TYPES,
} from '@/lib/hero-media'
import { toHeroMediaItem, type HeroMediaApiItem, type HeroMediaItem } from '@/types/hero-media'
import UploadProgress from '@/components/admin/UploadProgress'
import { uploadFormDataWithProgress } from '@/lib/upload-with-progress'

interface HeroSettings {
  id?: string
  title: string
  subtitle: string
  background_image: string
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string
  cta_secondary_link: string
  display_mode?: 'carousel' | 'static'
  is_active: boolean
}

type UploadedHeroMedia = {
  url: string
  type: 'image' | 'video'
  filename: string
  mimeType: string
  size: number
}

const defaultSettings: HeroSettings = {
  title: 'Dar LaMamy',
  subtitle: 'Un havre de paix au cœur de Fès',
  background_image: '/images/hero/hero-1.svg',
  cta_primary_text: 'Découvrir le riad',
  cta_primary_link: '/reservations',
  cta_secondary_text: 'Voir les chambres',
  cta_secondary_link: '/chambres',
  display_mode: 'carousel',
  is_active: true,
}

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<HeroSettings>(defaultSettings)
  const [carouselImages, setCarouselImages] = useState<HeroMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTarget, setUploadTarget] = useState<
    'background' | 'carousel' | `poster:${string}` | `replace:${string}` | null
  >(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [isDropActive, setIsDropActive] = useState(false)
  const [savedBackgroundUrl, setSavedBackgroundUrl] = useState(defaultSettings.background_image)
  const [pendingBackgroundUrl, setPendingBackgroundUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
    fetchCarouselImages()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/hero')
      const data = await res.json()
      if (res.ok && data) {
        const nextSettings = { ...defaultSettings, ...data }
        setSettings(nextSettings)
        setSavedBackgroundUrl(nextSettings.background_image)
        setPendingBackgroundUrl(null)
        setHasChanges(false)
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Erreur lors du chargement des parametres')
    } finally {
      setLoading(false)
    }
  }

  const fetchCarouselImages = async () => {
    try {
      const res = await fetch('/api/admin/hero/carousel')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setCarouselImages((data as HeroMediaApiItem[]).map(toHeroMediaItem))
      }
    } catch (err) {
      console.error('Error fetching carousel:', err)
    }
  }

  const handleInputChange = <K extends keyof HeroSettings>(field: K, value: HeroSettings[K]) => {
    setSettings({ ...settings, [field]: value })
    setHasChanges(true)
  }

  const deleteUploadedFile = async (url: string) => {
    if (!url.startsWith('/uploads/hero/')) return
    const response = await fetch('/api/admin/hero/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (!response.ok && response.status !== 404) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.error || 'Nettoyage du fichier impossible.')
    }
  }

  const uploadFile = async (file: File, isCarousel: boolean) => {
    setUploading(true)
    setUploadProgress(0)
    setUploadTarget(isCarousel ? 'carousel' : 'background')
    try {
      const isImage = HERO_IMAGE_MIME_TYPES.includes(file.type as (typeof HERO_IMAGE_MIME_TYPES)[number])
      const isVideo = HERO_VIDEO_MIME_TYPES.includes(file.type as (typeof HERO_VIDEO_MIME_TYPES)[number])
      if (!isImage && (!isCarousel || !isVideo)) throw new Error('Format de fichier non autorise.')
      if (isImage && file.size > HERO_IMAGE_MAX_BYTES) {
        throw new Error('Image trop volumineuse. Taille maximale : 8 Mo.')
      }
      if (isVideo && file.size > HERO_VIDEO_MAX_BYTES) {
        throw new Error('Vidéo trop volumineuse. Taille maximale : 50 Mo.')
      }

      const formData = new FormData()
      formData.append('file', file)

      const json = await uploadFormDataWithProgress<{
        success: boolean
        media?: UploadedHeroMedia
      }>('/api/admin/hero/upload', formData, setUploadProgress)

      if (json.media) {
        if (isCarousel) {
          const carouselRes = await fetch('/api/admin/hero/carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              media_type: json.media.type,
              media_url: json.media.url,
              filename: json.media.filename,
              mime_type: json.media.mimeType,
              size: json.media.size,
            })
          })

          if (!carouselRes.ok) {
            const err = await carouselRes.json().catch(() => ({}))
            await deleteUploadedFile(json.media.url).catch(() => undefined)
            throw new Error(err?.error || "Erreur lors de l'ajout au carrousel")
          }

          await fetchCarouselImages()
          toast.success(json.media.type === 'video' ? 'Vidéo ajoutée au carrousel.' : 'Image ajoutée au carrousel.')
        } else {
          if (json.media.type !== 'image') {
            await deleteUploadedFile(json.media.url).catch(() => undefined)
            throw new Error("L'arrière-plan statique doit être une image.")
          }
          if (pendingBackgroundUrl && pendingBackgroundUrl !== json.media.url) {
            await deleteUploadedFile(pendingBackgroundUrl).catch(() => undefined)
          }
          setPendingBackgroundUrl(json.media.url)
          handleInputChange('background_image', json.media.url)
          toast.success('Image téléversée. Enregistrez pour la publier.')
        }
      }
    } catch (err: unknown) {
      console.error('Upload error:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du telechargement')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadTarget(null)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCarousel = false) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file, isCarousel)
    e.target.value = ''
  }

  const handleDeleteCarouselImage = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer ce media?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/hero/carousel/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setCarouselImages((current) => current.filter((item) => item.id !== id))
        toast.success('Media supprime')
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (err: unknown) {
      console.error('Delete error:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const handleReorderCarousel = async (sourceIndex: number, destIndex: number) => {
    const newImages = [...carouselImages]
    const [movedImage] = newImages.splice(sourceIndex, 1)
    newImages.splice(destIndex, 0, movedImage)
    setCarouselImages(newImages)

    try {
      await fetch('/api/admin/hero/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newImages.map(({ id }) => ({ id })) })
      })
      toast.success('Ordre mis a jour')
    } catch (err) {
      console.error('Reorder error:', err)
      toast.error('Erreur lors de la mise a jour')
    }
  }

  const updateCarouselItem = async (
    id: string,
    patch: Partial<Pick<HeroMediaApiItem, 'poster_url' | 'alt_text' | 'is_active'>>,
  ) => {
    const res = await fetch(`/api/admin/hero/carousel/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Mise a jour impossible.')
    await fetchCarouselImages()
  }

  const handlePosterUpload = async (id: string, file?: File) => {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    setUploadTarget(`poster:${id}`)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', 'poster')
      const data = await uploadFormDataWithProgress<{ success: boolean; media?: UploadedHeroMedia }>(
        '/api/admin/hero/upload',
        formData,
        setUploadProgress,
      )
      if (!data.media?.url) throw new Error("L'URL du poster est manquante.")
      try {
        await updateCarouselItem(id, { poster_url: data.media.url })
      } catch (error) {
        await deleteUploadedFile(data.media.url).catch(() => undefined)
        throw error
      }
      toast.success('Poster vidéo mis à jour.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload du poster impossible.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadTarget(null)
    }
  }

  const handleReplaceMedia = async (id: string, file?: File) => {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    setUploadTarget(`replace:${id}`)
    let uploadedUrl: string | null = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await uploadFormDataWithProgress<{ success: boolean; media?: UploadedHeroMedia }>(
        '/api/admin/hero/upload',
        formData,
        setUploadProgress,
      )
      if (!data.media) throw new Error('Réponse de téléversement incomplète.')
      uploadedUrl = data.media.url

      const response = await fetch(`/api/admin/hero/carousel/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_url: data.media.url,
          media_type: data.media.type,
          filename: data.media.filename,
          mime_type: data.media.mimeType,
          size: data.media.size,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Remplacement impossible.')

      await fetchCarouselImages()
      toast.success('Média Hero remplacé.')
    } catch (error) {
      if (uploadedUrl) await deleteUploadedFile(uploadedUrl).catch(() => undefined)
      toast.error(error instanceof Error ? error.message : 'Remplacement impossible.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadTarget(null)
    }
  }

  const handleSave = async () => {
    if (!settings.title || !settings.subtitle || !settings.background_image) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erreur sauvegarde')
      }

      toast.success('Parametres sauvegardes avec succes!')
      setHasChanges(false)
      if (
        pendingBackgroundUrl &&
        savedBackgroundUrl !== pendingBackgroundUrl &&
        savedBackgroundUrl.startsWith('/uploads/hero/')
      ) {
        await deleteUploadedFile(savedBackgroundUrl).catch((cleanupError) =>
          console.error('Previous background cleanup failed:', cleanupError),
        )
      }
      setSavedBackgroundUrl(settings.background_image)
      setPendingBackgroundUrl(null)
    } catch (err: unknown) {
      console.error('Save error:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Etes-vous sur ? Les modifications non sauvegardees seront perdues.')) {
      if (pendingBackgroundUrl) void deleteUploadedFile(pendingBackgroundUrl).catch(() => undefined)
      fetchSettings()
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Taille non disponible'
    return `${(bytes / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
  }

  const filenameFromUrl = (url: string) => decodeURIComponent(url.split('/').pop() || 'Média Hero')

  const previewMedia =
    settings.display_mode === 'carousel' && carouselImages.length > 0
      ? carouselImages[0]
      : {
          mediaType: 'image' as const,
          mediaUrl: settings.background_image,
          posterUrl: null,
        }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f2ea]">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des parametres...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
        <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Hero</p>
              <h1 className="text-3xl font-semibold text-gray-900">Section Hero</h1>
              <p className="text-sm text-gray-600">Personnalisez la banniere principale de la page d'accueil.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={settings.is_active}
                onClick={() => handleInputChange('is_active', !settings.is_active)}
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${settings.is_active ? 'bg-[#0F5A46]' : 'bg-gray-300'}`}
                  aria-hidden="true"
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${settings.is_active ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
                  />
                </span>
                Hero {settings.is_active ? 'actif' : 'inactif'}
              </button>
              <button
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} />
                Reinitialiser
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-amber-50"
              >
                <Eye size={16} />
                Apercu
              </a>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
            Vous avez des modifications non sauvegardees
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-amber-200/50 bg-[#17110d] shadow-[0_24px_60px_-38px_rgba(26,18,12,0.75)]">
          <div className="relative aspect-[16/7] min-h-[280px] w-full">
            {previewMedia.mediaType === 'video' ? (
              <video
                src={previewMedia.mediaUrl}
                poster={previewMedia.posterUrl || undefined}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <img
                src={previewMedia.mediaUrl}
                alt="Aperçu du Hero"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-[#FFFDF8] sm:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D2AA5A]">Aperçu du Hero</p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{settings.title}</h2>
              <div className="my-4 h-px w-20 bg-[#B28A47]" />
              <p className="max-w-2xl text-sm text-white/85 sm:text-base">{settings.subtitle}</p>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode d'affichage</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <label
                  className={`flex items-start rounded-2xl border p-4 cursor-pointer transition-all ${
                    settings.display_mode === 'carousel'
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    value="carousel"
                    checked={settings.display_mode === 'carousel'}
                    onChange={() => handleInputChange('display_mode', 'carousel')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Carrousel</p>
                    <p className="text-sm text-gray-600 mt-1">Slideshow automatique d'images avec texte superpose</p>
                  </div>
                </label>
                <label
                  className={`flex items-start rounded-2xl border p-4 cursor-pointer transition-all ${
                    settings.display_mode === 'static'
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    value="static"
                    checked={settings.display_mode === 'static'}
                    onChange={() => handleInputChange('display_mode', 'static')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Statique</p>
                    <p className="text-sm text-gray-600 mt-1">Image unique fixe avec titre et boutons</p>
                  </div>
                </label>
              </div>
            </div>

            <hr className="my-8" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenu textuel</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal *</label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                    placeholder="Ex: Bienvenue au Riad Dar Al Andalus"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.title.length}/100 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre / Description *</label>
                  <textarea
                    value={settings.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                    placeholder="Ex: Une oasis de paix au coeur de la medina"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.subtitle.length}/500 caracteres</p>
                </div>
              </div>
            </div>

            <hr className="my-8" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Image de fond</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-amber-50 transition-colors cursor-pointer">
                    <Upload size={16} className="text-gray-600" />
                    <span>{uploading ? 'Telechargement...' : 'Choisir une image'}</span>
                    <input
                      type="file"
                      accept={HERO_IMAGE_MIME_TYPES.join(',')}
                      onChange={(e) => handleImageUpload(e, false)}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {settings.background_image ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">Image configuree</span>
                  ) : null}
                </div>
                {uploading && uploadTarget === 'background' && (
                  <UploadProgress value={uploadProgress} label="Téléchargement de l'image de fond" />
                )}
                {settings.background_image ? (
                  <div className="relative w-full h-64 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    <img
                      src={settings.background_image}
                      alt="Apercu"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {settings.display_mode === 'carousel' && (
              <>
                <hr className="my-8" />

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Medias du carrousel</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Ajoutez des images ou des videos et organisez-les par glisser-deposer.
                  </p>

                  <div className="space-y-4">
                    <div
                      onDragEnter={(event) => {
                        event.preventDefault()
                        if (!uploading) setIsDropActive(true)
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDropActive(false)
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        setIsDropActive(false)
                        const file = event.dataTransfer.files?.[0]
                        if (file && !uploading) void uploadFile(file, true)
                      }}
                      className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                        isDropActive ? 'border-[#0F5A46] bg-emerald-50' : 'border-[#B28A47]/35 bg-[#FBF8F2]'
                      }`}
                    >
                      <Upload className="mx-auto h-7 w-7 text-[#0F5A46]" strokeWidth={1.7} />
                      <p className="mt-3 text-sm font-semibold text-gray-900">Importer une image ou une vidéo</p>
                      <p className="mt-1 text-xs text-gray-500">Glissez-déposez ou sélectionnez un fichier</p>
                      <p className="mt-2 text-[11px] text-gray-500">JPG, PNG, WebP · 8 Mo max — MP4, WebM · 50 Mo max</p>
                      <label className="mt-4 inline-flex cursor-pointer items-center rounded-full bg-[#0F5A46] px-5 py-2.5 text-xs font-semibold text-[#FFFDF8] hover:bg-[#12604B]">
                        {uploading && uploadTarget === 'carousel' ? 'Téléversement…' : 'Choisir un fichier'}
                        <input
                          type="file"
                          accept={HERO_MEDIA_ACCEPT}
                          onChange={(e) => handleImageUpload(e, true)}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-3 text-xs font-medium text-[#0F5A46]">
                        {carouselImages.length} média{carouselImages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {uploading && uploadTarget === 'carousel' && (
                      <UploadProgress value={uploadProgress} label="Téléchargement du média" />
                    )}
                    {carouselImages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {carouselImages.map((img, idx) => (
                          <div
                            key={img.id}
                            draggable
                            onDragStart={() => setDraggedId(img.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedId && draggedId !== img.id) {
                                const sourceIdx = carouselImages.findIndex(i => i.id === draggedId)
                                handleReorderCarousel(sourceIdx, idx)
                              }
                            }}
                            className={`group overflow-hidden rounded-2xl border bg-white transition-all ${
                              draggedId === img.id ? 'border-amber-300 opacity-60' : 'border-gray-200'
                            }`}
                          >
                            <div className="relative h-48 w-full bg-gray-950">
                              {img.mediaType === 'video' ? (
                                <video
                                  src={img.mediaUrl}
                                  poster={img.posterUrl || undefined}
                                  className="h-full w-full object-cover"
                                  muted
                                  playsInline
                                  controls
                                  preload="metadata"
                                />
                              ) : (
                                <img
                                  src={img.mediaUrl}
                                  alt={img.altText || `Carousel ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              )}
                              <div className="absolute left-2 top-2 flex items-center gap-2">
                                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                                  {idx + 1}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                  {img.mediaType === 'video' ? <Video size={13} /> : <ImageIcon size={13} />}
                                  {img.mediaType === 'video' ? 'VIDEO' : 'IMAGE'}
                                </span>
                                {!img.isActive && (
                                  <span className="rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-white">
                                    INACTIF
                                  </span>
                                )}
                              </div>
                              <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="cursor-grab rounded-xl bg-black/60 p-2 text-white backdrop-blur" title="Reorganiser">
                                  <GripVertical size={18} />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCarouselImage(img.id)}
                                  disabled={deletingId === img.id}
                                  className="rounded-xl bg-red-600 p-2 text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                                  aria-label="Supprimer le media"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-3 p-4">
                              <div className="grid gap-1 rounded-xl bg-[#F7F3EB] px-3 py-2 text-xs text-gray-600">
                                <span><strong className="text-gray-800">Type :</strong> {img.mimeType || (img.mediaType === 'video' ? 'Vidéo' : 'Image')}</span>
                                <span><strong className="text-gray-800">Taille :</strong> {formatBytes(img.size)}</span>
                                <span className="truncate"><strong className="text-gray-800">Fichier :</strong> {img.filename || filenameFromUrl(img.mediaUrl)}</span>
                              </div>
                              <label className="block text-xs font-semibold text-gray-700">
                                Texte alternatif
                                <input
                                  type="text"
                                  defaultValue={img.altText || ''}
                                  maxLength={180}
                                  onBlur={(event) =>
                                    updateCarouselItem(img.id, { alt_text: event.currentTarget.value }).catch((error) =>
                                      toast.error(error instanceof Error ? error.message : 'Mise a jour impossible.'),
                                    )
                                  }
                                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal"
                                  placeholder={img.mediaType === 'image' ? 'Description de la photo' : 'Description du poster'}
                                />
                              </label>
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCarouselItem(img.id, { is_active: !img.isActive })
                                      .then(() => toast.success(img.isActive ? 'Media desactive.' : 'Media active.'))
                                      .catch((error) => toast.error(error instanceof Error ? error.message : 'Mise a jour impossible.'))
                                  }
                                  className={`rounded-full px-3 py-2 text-xs font-semibold ${
                                    img.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {img.isActive ? 'Actif' : 'Inactif'}
                                </button>
                                {img.mediaType === 'video' && (
                                  <label className="cursor-pointer rounded-full border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                                    {img.posterUrl ? 'Remplacer le poster' : 'Ajouter un poster'}
                                    <input
                                      type="file"
                                      accept={HERO_IMAGE_MIME_TYPES.join(',')}
                                      className="hidden"
                                      disabled={uploading}
                                      onChange={(event) => handlePosterUpload(img.id, event.target.files?.[0])}
                                    />
                                  </label>
                                )}
                                <label className="cursor-pointer rounded-full border border-[#0F5A46]/25 px-3 py-2 text-xs font-semibold text-[#0F5A46] hover:bg-emerald-50">
                                  Remplacer
                                  <input
                                    type="file"
                                    accept={HERO_MEDIA_ACCEPT}
                                    className="hidden"
                                    disabled={uploading || deletingId === img.id}
                                    onChange={(event) => {
                                      void handleReplaceMedia(img.id, event.target.files?.[0])
                                      event.currentTarget.value = ''
                                    }}
                                  />
                                </label>
                              </div>
                              {uploading && uploadTarget === `poster:${img.id}` && (
                                <UploadProgress value={uploadProgress} label="Téléchargement du poster" />
                              )}
                              {uploading && uploadTarget === `replace:${img.id}` && (
                                <UploadProgress value={uploadProgress} label="Remplacement du média" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-600 mb-2">Aucun media pour le carrousel</p>
                        <p className="text-sm text-gray-500">Cliquez sur "Ajouter un media" pour commencer</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {settings.display_mode === 'static' && (
              <>
                <hr className="my-8" />
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
                  <strong>Mode statique:</strong> En mode statique, seule l'image de fond definie ci-dessus est utilisee. Basculez en mode "Carrousel" pour ajouter des images qui defileront automatiquement.
                </div>
              </>
            )}

            <hr className="my-8" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Boutons d'action</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300">Bouton principal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton *</label>
                      <input
                        type="text"
                        value={settings.cta_primary_text}
                        onChange={(e) => handleInputChange('cta_primary_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                        placeholder="Reserver maintenant"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">{settings.cta_primary_text.length}/50</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lien URL *</label>
                      <input
                        type="text"
                        value={settings.cta_primary_link}
                        onChange={(e) => handleInputChange('cta_primary_link', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                        placeholder="/reservations"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300">Bouton secondaire</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton *</label>
                      <input
                        type="text"
                        value={settings.cta_secondary_text}
                        onChange={(e) => handleInputChange('cta_secondary_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                        placeholder="Decouvrir nos chambres"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">{settings.cta_secondary_text.length}/50</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lien URL *</label>
                      <input
                        type="text"
                        value={settings.cta_secondary_link}
                        onChange={(e) => handleInputChange('cta_secondary_link', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                        placeholder="/chambres"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 mb-3">INFO Recommandations</h3>
          <ul className="text-sm text-amber-900 space-y-2">
            <li>- Titre: Maximum 100 caracteres</li>
            <li>- Sous-titre: Maximum 500 caracteres</li>
            <li>- Images recommandees: 1920x1080px ou plus</li>
            <li>- Images: JPG, PNG ou WebP, maximum 8 Mo</li>
            <li>- Videos: MP4 ou WebM, maximum 50 Mo</li>
            <li>- Pour de meilleures performances, utilisez une video courte, sans son, idealement inferieure a 15-20 Mo.</li>
            <li>- URLs des boutons: Utilisez des chemins relatifs (/reservations, /chambres...)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
