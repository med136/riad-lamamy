'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Search, Grid, List, ImageIcon, Trash2, Star, Plus } from 'lucide-react'
import Modal from '@/components/admin/crud/Modal'
import DeleteConfirmation from '@/components/admin/crud/DeleteConfirmation'
import toast from 'react-hot-toast'

interface GalleryItem {
  id: string
  title: string
  category: string
  featured: boolean
  url: string
  room_id?: string
  service_id?: string
  room?: { id: string; name: string }
  service?: { id: string; name: string }
  created_at?: string
}

interface Room {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
}

export default function GaleriePage() {
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [itemForm, setItemForm] = useState({
    title: '',
    category: 'chambres',
    featured: false,
    url: '',
    room_id: '',
    service_id: '',
  })

  // Récupérer les images de la galerie
  const fetchGalleryItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      const json = await res.json()
      if (res.ok) {
        setGalleryItems(json.items || [])
      } else {
        toast.error(json.error || 'Erreur lors du chargement')
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Impossible de charger la galerie')
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les chambres et services
  const fetchRoomsAndServices = async () => {
    try {
      const [roomsRes, servicesRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/admin/services')
      ])
      
      const roomsJson = await roomsRes.json()
      const servicesJson = await servicesRes.json()
      
      if (roomsRes.ok) {
        setRooms(roomsJson.rooms || roomsJson || [])
      }
      if (servicesRes.ok) {
        setServices(servicesJson.services || servicesJson || [])
      }
    } catch (err) {
      console.error('Error fetching rooms/services:', err)
    }
  }

  useEffect(() => {
    fetchGalleryItems()
    fetchRoomsAndServices()
  }, [])

  // Filtrer les images
  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Ajouter une nouvelle image
  const handleAdd = () => {
    setSelectedItem(null)
    setItemForm({
      title: '',
      category: 'chambres',
      featured: false,
      url: '',
      room_id: '',
      service_id: '',
    })
    setIsAddModalOpen(true)
  }

  // Éditer une image
  const handleEdit = (item: GalleryItem) => {
    setSelectedItem(item)
    setItemForm({
      title: item.title,
      category: item.category,
      featured: item.featured,
      url: item.url,
      room_id: item.room_id || '',
      service_id: item.service_id || '',
    })
    setIsEditModalOpen(true)
  }

  // Supprimer une image
  const handleDelete = (id: string) => {
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      const res = await fetch(`/api/admin/gallery/${itemToDelete}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur suppression')
      toast.success('Image supprimée')
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
      await fetchGalleryItems()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression')
    }
  }

  // Sauvegarder (ajout ou édition)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemForm.title || !itemForm.url) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      if (selectedItem) {
        // Édition
        const res = await fetch(`/api/admin/gallery/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erreur édition')
        toast.success('Image modifiée')
        setIsEditModalOpen(false)
      } else {
        // Création
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erreur création')
        toast.success('Image ajoutée')
        setIsAddModalOpen(false)
      }
      await fetchGalleryItems()
    } catch (err: any) {
      console.error('Save error:', err)
      toast.error(err.message || 'Erreur')
    }
  }

  // Upload d'images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('roomId', 'gallery-' + Date.now())

      const res = await fetch('/api/upload/room-images', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur upload')

      // Pré-remplir le formulaire avec la première image
      if (json.urls && json.urls.length > 0) {
        setItemForm({
          ...itemForm,
          url: json.urls[0],
        })
        toast.success('Image téléchargée!')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Erreur lors du téléchargement')
    } finally {
      setUploadingImages(false)
      if (e.target) e.target.value = ''
    }
  }

  const stats = {
    total: galleryItems.length,
    featured: galleryItems.filter(i => i.featured).length,
    chambres: galleryItems.filter(i => i.category === 'chambres').length,
    services: galleryItems.filter(i => i.category === 'services').length,
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Galerie</p>
          <h1 className="text-3xl font-semibold text-gray-900">Galerie photos</h1>
          <p className="text-sm text-gray-600">Gérez les images et mises en avant du riad.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
        >
          <Plus size={16} />
          Ajouter une photo
        </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total photos</p>
              <p className="text-2xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <ImageIcon className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mises en avant</p>
              <p className="text-2xl font-bold mt-2">{stats.featured}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chambres</p>
              <p className="text-2xl font-bold mt-2">{stats.chambres}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <div className="text-purple-600">🛏️</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Services</p>
              <p className="text-2xl font-bold mt-2">{stats.services}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <div className="text-green-600">✨</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une photo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-amber-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-gray-800 placeholder:text-amber-300 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setSelectedCategory('chambres')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === 'chambres'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Chambres
          </button>
          <button
            onClick={() => setSelectedCategory('services')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === 'services'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Services
          </button>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-amber-200/70 bg-white shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition ${
              viewMode === 'grid' ? 'bg-amber-50 text-amber-800' : 'text-gray-700 hover:bg-amber-50'
            }`}
            aria-pressed={viewMode === 'grid'}
          >
            <Grid size={16} />
            Grille
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition ${
              viewMode === 'list' ? 'bg-amber-50 text-amber-800' : 'text-gray-700 hover:bg-amber-50'
            }`}
            aria-pressed={viewMode === 'list'}
          >
            <List size={16} />
            Liste
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la galerie...</p>
        </div>
      )}

      {/* Gallery grid */}
      {!loading && (
        <>
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden">
              <div className="text-center py-12">
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune image trouvée</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                      }}
                    />
                    {item.featured && (
                      <div className="absolute top-2 right-2 rounded-full bg-amber-500 p-2 text-white shadow-sm">
                        <Star size={16} className="fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                      {item.room && <p className="text-xs text-blue-600">🛏️ {item.room.name}</p>}
                      {item.service && <p className="text-xs text-green-600">✨ {item.service.name}</p>}
                    </div>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 rounded-full border border-amber-200/60 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-amber-50"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-amber-100">
                <thead className="bg-amber-50/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Image</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Titre</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Catégorie</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Mise en avant</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40">
                      <td className="px-6 py-4">
                        <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={item.url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                          {item.room && <div className="text-xs text-blue-600">🛏️ {item.room.name}</div>}
                          {item.service && <div className="text-xs text-green-600">✨ {item.service.name}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/70 capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.featured ? (
                          <Star size={20} className="text-amber-500 fill-amber-500" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-2 text-xs font-semibold text-gray-800 rounded-full border border-amber-200/60 bg-white shadow-sm hover:bg-amber-50"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal d'ajout */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une photo"
        size="lg"
      >
        <form id="crud-form" onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={itemForm.category}
                onChange={(e) => {
                  setItemForm({ ...itemForm, category: e.target.value, room_id: '', service_id: '' })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="chambres">Chambres</option>
                <option value="services">Services</option>
                <option value="architecture">Architecture</option>
                <option value="vues">Vues</option>
              </select>
            </div>

            {itemForm.category === 'chambres' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
                <select
                  value={itemForm.room_id}
                  onChange={(e) => setItemForm({ ...itemForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Sélectionner une chambre --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
            )}

            {itemForm.category === 'services' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={itemForm.service_id}
                  onChange={(e) => setItemForm({ ...itemForm, service_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Sélectionner un service --</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Cliquez ou glissez une image</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>
              {itemForm.url && (
                <p className="text-sm text-green-600 mt-2">✓ Image sélectionnée</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={itemForm.featured}
                onChange={(e) => setItemForm({ ...itemForm, featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Mettre en avant
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-amber-50/40"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modifier: ${selectedItem?.title}`}
        size="lg"
      >
        <form id="crud-form" onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="chambres">Chambres</option>
                <option value="services">Services</option>
                <option value="architecture">Architecture</option>
                <option value="vues">Vues</option>
              </select>
            </div>

            {/* Room selection for edit */}
            {itemForm.category === 'chambres' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
                <select
                  value={itemForm.room_id}
                  onChange={(e) => setItemForm({ ...itemForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Sélectionner une chambre --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Service selection for edit */}
            {itemForm.category === 'services' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={itemForm.service_id}
                  onChange={(e) => setItemForm({ ...itemForm, service_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Sélectionner un service --</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured-edit"
                checked={itemForm.featured}
                onChange={(e) => setItemForm({ ...itemForm, featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="featured-edit" className="ml-2 block text-sm text-gray-900">
                Mettre en avant
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-amber-50/40"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de suppression */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={confirmDelete}
        itemName="cette photo"
        message="Cette action est irréversible."
      />
      </div>
    </div>
  )
}
