'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { createClient, uploadFile } from '@/lib/supabase/client'

const CATEGORIES = [
  'chambres',
  'restaurant',
  'spa',
  'jardin',
  'piscine',
  'evenement',
  'architecture',
]

export default function GalleryNewPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setError(null)
    if (f) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!file) {
      setError('Veuillez sélectionner un fichier.')
      return
    }

    setLoading(true)
    try {
      const path = `gallery/${Date.now()}_${file.name}`
      const publicUrl = await uploadFile(file, 'gallery', path)

      const supabase = createClient()
      const { error: dbError } = await supabase.from('gallery').insert([
        {
          title,
          description,
          category,
          image_url: publicUrl,
          thumbnail_url: publicUrl,
          alt_text: title || null,
          is_featured: featured,
          is_published: published,
        },
      ])

      if (dbError) throw dbError

      router.push('/admin/galerie')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter une photo</h1>
          <p className="text-gray-600">Téléversez une nouvelle image pour la galerie</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
        </div>

        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
              <Upload size={18} className="mr-2" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <span>{file ? file.name : 'Choisir un fichier'}</span>
            </label>
            {preview && (
              <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                <img src={preview} alt="preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <span className="text-sm">Mise en avant</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span className="text-sm">Publié</span>
          </label>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-lg">Annuler</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {loading ? 'Téléversement...' : 'Ajouter la photo'}
          </button>
        </div>
      </form>
    </div>
  )
}
