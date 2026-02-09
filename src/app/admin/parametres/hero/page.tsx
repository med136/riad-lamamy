'use client'

import { useState, useEffect } from 'react'
import { Upload, Save, Eye, RotateCcw, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

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
}

interface CarouselImage {
  id: string
  image_url: string
  display_order: number
}

const defaultSettings: HeroSettings = {
  title: 'Bienvenue au Riad Dar Al Andalus',
  subtitle: 'Une oasis de paix au coeur de la medina',
  background_image: '/images/hero/hero-1.svg',
  cta_primary_text: 'Reserver maintenant',
  cta_primary_link: '/reservations',
  cta_secondary_text: 'Decouvrir nos chambres',
  cta_secondary_link: '/chambres',
  display_mode: 'carousel'
}

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<HeroSettings>(defaultSettings)
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)

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
        setSettings({ ...defaultSettings, ...data })
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
        setCarouselImages(data)
      }
    } catch (err) {
      console.error('Error fetching carousel:', err)
    }
  }

  const handleInputChange = (field: keyof HeroSettings, value: any) => {
    setSettings({ ...settings, [field]: value })
    setHasChanges(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCarousel = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('roomId', 'hero-' + Date.now())

      const res = await fetch('/api/upload/room-images', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur upload')

      if (json.urls && json.urls.length > 0) {
        if (isCarousel) {
          // Ajouter au carrousel
          const carouselRes = await fetch('/api/admin/hero/carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: json.urls[0] })
          })

          if (!carouselRes.ok) {
            const err = await carouselRes.json().catch(() => ({}))
            throw new Error(err?.error || "Erreur lors de l'ajout au carrousel")
          }

          await fetchCarouselImages()
          toast.success('Image ajoutee au carrousel!')
        } else {
          // Ajouter comme image de fond
          handleInputChange('background_image', json.urls[0])
          toast.success('Image telechargee avec succes!')
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Erreur lors du telechargement')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDeleteCarouselImage = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette image?')) return

    try {
      const res = await fetch(`/api/admin/hero/carousel/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchCarouselImages()
        toast.success('Image supprimee')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Erreur lors de la suppression')
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
        body: JSON.stringify({ images: newImages })
      })
      toast.success('Ordre mis a jour')
    } catch (err) {
      console.error('Reorder error:', err)
      toast.error('Erreur lors de la mise a jour')
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
    } catch (err: any) {
      console.error('Save error:', err)
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Etes-vous sur ? Les modifications non sauvegardees seront perdues.')) {
      fetchSettings()
    }
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
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {settings.background_image ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">Image configuree</span>
                  ) : null}
                </div>

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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Images du carrousel</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Ajoutez et organisez les images qui defileront automatiquement. Vous pouvez les reorganiser par glisser-deposer.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer">
                        <Upload size={16} className="text-amber-600" />
                        <span>{uploading ? 'Telechargement...' : 'Ajouter une image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-600">
                        {carouselImages.length} image{carouselImages.length !== 1 ? 's' : ''}
                      </span>
                    </div>

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
                            className={`relative group rounded-2xl overflow-hidden border transition-all ${
                              draggedId === img.id ? 'border-amber-300 opacity-60' : 'border-gray-200'
                            }`}
                          >
                            <div className="relative w-full h-40 bg-gray-100">
                              <img
                                src={img.image_url}
                                alt={`Carousel ${idx + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3">
                              <div className="flex items-center text-white text-sm">
                                <GripVertical size={18} className="mr-2" />
                                <span>Reorganiser</span>
                              </div>
                              <button
                                onClick={() => handleDeleteCarouselImage(img.id)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="absolute top-2 left-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-600 mb-2">Aucune image pour le carrousel</p>
                        <p className="text-sm text-gray-500">Cliquez sur "Ajouter une image" pour commencer</p>
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
            <li>- Formats supportes: JPG, PNG, WebP</li>
            <li>- URLs des boutons: Utilisez des chemins relatifs (/reservations, /chambres...)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
