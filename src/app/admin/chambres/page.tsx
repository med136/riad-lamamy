'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, Bed, Users, DollarSign, Upload, X } from 'lucide-react'
import Modal from '@/components/admin/crud/Modal'
import DeleteConfirmation from '@/components/admin/crud/DeleteConfirmation'
import Image from 'next/image'
import toast from 'react-hot-toast'

// Types
interface Room {
  id: string
  name: string
  description: string
  price: number
  capacity: number
  status: 'available' | 'occupied' | 'maintenance'
  amenities: string[]
  images: string[]
  featured: boolean
  createdAt: string
} 

// Données initiales
const initialRooms: Room[] = [
  {
    id: '1',
    name: 'Suite Royale',
    description: 'Suite luxueuse avec vue sur le jardin et salle de bain en marbre',
    price: 4500,
    capacity: 4,
    status: 'available',
    amenities: ['Wi-Fi', 'TV écran plat', 'Minibar', 'Climatisation', 'Spa'],
    images: ['/images/rooms/suite-royale.jpg'],
    featured: true,
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Chambre Deluxe',
    description: 'Chambre confortable avec balcon privé',
    price: 2800,
    capacity: 2,
    status: 'occupied',
    amenities: ['Wi-Fi', 'TV', 'Climatisation'],
    images: ['/images/rooms/deluxe.jpg'],
    featured: false,
    createdAt: '2024-01-12'
  },
]

export default function ChambresPage() {
  // États
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [search, setSearch] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null)

  // Form states
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    price: '',
    capacity: '2',
    status: 'available' as Room['status'],
    amenities: [] as string[],
    images: [] as string[],
    featured: false
  })

  // Chargement depuis l'API
  const [isLoading, setIsLoading] = useState(false)

  const fetchRooms = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/rooms')
      if (!res.ok) throw new Error(await res.text())
      const raw: any[] = await res.json()
      const data: Room[] = raw.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: Number(r.price || 0),
        capacity: Number(r.max_guests ?? 2),
        status: r.status,
        amenities: Array.isArray(r.amenities) ? r.amenities : [],
        images: Array.isArray(r.images) ? r.images : [],
        featured: Boolean(r.featured),
        createdAt: r.created_at || r.createdAt || ''
      }))
      setRooms(data)
    } catch (err) {
      console.error('Failed to fetch rooms', err)
      toast.error('Impossible de charger les chambres')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  // Filtrer les chambres
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase()) ||
    room.description.toLowerCase().includes(search.toLowerCase())
  )

  // Gestion de l'ajout
  const handleAdd = () => {
    setIsAddModalOpen(true)
    setRoomForm({
      name: '',
      description: '',
      price: '',
      capacity: '2',
      status: 'available',
      amenities: [],
      images: [],
      featured: false
    })
  }

  // Gestion de l'édition
  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setRoomForm({
      name: room.name,
      description: room.description,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      status: room.status,
      amenities: room.amenities,
      images: room.images,
      featured: room.featured
    })
    setIsEditModalOpen(true)
  }

  // Gestion du téléchargement d'images
  const [uploadingImages, setUploadingImages] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('roomId', selectedRoom?.id || 'new-' + Date.now())

      const res = await fetch('/api/upload/room-images', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur upload')

      const newImages = [...roomForm.images, ...json.urls]
      setRoomForm({ ...roomForm, images: newImages })
      toast.success(`${json.urls.length} image(s) téléchargée(s)`)
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Erreur lors du téléchargement')
    } finally {
      setUploadingImages(false)
      // Reset input
      if (e.target) e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = roomForm.images.filter((_, i) => i !== index)
    setRoomForm({ ...roomForm, images: newImages })
  }

  // Gestion de la suppression
  const handleDelete = (id: string) => {
    setRoomToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const confirmDelete = async () => {
    if (!roomToDelete) return
    try {
      const res = await fetch(`/api/admin/rooms/${encodeURIComponent(roomToDelete)}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || (await res.text()) || 'Erreur lors de la suppression')
      }
      toast.success('Chambre supprimée avec succès')
      setRoomToDelete(null)
      setIsDeleteModalOpen(false)
      await fetchRooms()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erreur lors de la suppression')
    }
  }

  // Sauvegarder (ajout ou édition)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomForm.name || !roomForm.price) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    const payload = {
      name: roomForm.name,
      description: roomForm.description,
      price: Number(roomForm.price),
      capacity: Number(roomForm.capacity),
      status: roomForm.status,
      amenities: roomForm.amenities,
      images: roomForm.images || [],
      featured: roomForm.featured
    }

    try {
      if (selectedRoom && selectedRoom.id) {
        const res = await fetch(`/api/admin/rooms/${selectedRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          // Try to parse JSON error
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || (await res.text()) || 'Erreur lors de la requête')
        }
        toast.success('Chambre modifiée avec succès')
        setIsEditModalOpen(false)
        setSelectedRoom(null)
      } else {
        const res = await fetch('/api/admin/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || (await res.text()) || 'Erreur lors de la création')
        }
        toast.success('Chambre ajoutée avec succès')
        setIsAddModalOpen(false)
      }

      await fetchRooms()
    } catch (err: any) {
      console.error('Save room error:', err)
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Chambres</p>
            <h1 className="text-3xl font-semibold text-gray-900">Gestion des chambres</h1>
            <p className="text-sm text-gray-600">Gerez les chambres, tarifs et disponibilites.</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
          >
            <Plus size={16} />
            Ajouter une chambre
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total chambres</p>
              <p className="text-2xl font-bold mt-2">{rooms.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Bed className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disponibles</p>
              <p className="text-2xl font-bold mt-2">
                {rooms.filter(r => r.status === 'available').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <div className="text-green-600">✅</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupées</p>
              <p className="text-2xl font-bold mt-2">
                {rooms.filter(r => r.status === 'occupied').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <div className="text-red-600">🚫</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenu moyen</p>
              <p className="text-2xl font-bold mt-2">
                {Math.round(rooms.reduce((acc, r) => acc + r.price, 0) / rooms.length)} DH
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une chambre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-amber-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-gray-800 placeholder:text-amber-300 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm hover:bg-amber-50">
          <Filter size={16} />
          Filtrer
        </button>
      </div>

      {/* Table des chambres */}
      {isLoading && (
        <div className="p-4 bg-yellow-50 rounded-md text-sm text-gray-700 mb-4">Chargement des chambres…</div>
      )}
      <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-amber-50/70">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Chambre</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Prix (DH)</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Statut</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Capacité</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-amber-50/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Bed size={24} className="text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {room.description}
                        </div>
                        {room.featured && (
                          <span className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/70">
                            En vedette
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{room.price.toLocaleString()} DH</span>
                    <div className="text-sm text-gray-500">/nuit</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                      room.status === 'available' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70' :
                      room.status === 'occupied' ? 'bg-rose-50 text-rose-700 ring-rose-200/70' :
                      'bg-amber-50 text-amber-700 ring-amber-200/70'
                    }`}>
                      {room.status === 'available' ? 'Disponible' :
                       room.status === 'occupied' ? 'Occupée' : 'Maintenance'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <span>{room.capacity} personnes</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(room)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une nouvelle chambre"
        size="lg"
      >
        <form id="crud-form" onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la chambre *
              </label>
              <input
                type="text"
                value={roomForm.name}
                onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={roomForm.description}
                onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par nuit (DH) *
                </label>
                <input
                  type="number"
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({...roomForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité *
                </label>
                <select
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="1">1 personne</option>
                  <option value="2">2 personnes</option>
                  <option value="3">3 personnes</option>
                  <option value="4">4 personnes</option>
                  <option value="5">5+ personnes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({...roomForm, status: e.target.value as Room['status']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Occupée</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={roomForm.featured}
                onChange={(e) => setRoomForm({...roomForm, featured: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Mettre en vedette
              </label>
            </div>

            {/* Téléchargement d'images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images de la chambre
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Cliquez ou glissez des images
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Affichage des images téléchargées */}
              {roomForm.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Images téléchargées ({roomForm.images.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {roomForm.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={img}
                            alt={`Image ${idx + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modifier la chambre: ${selectedRoom?.name}`}
        size="lg"
      >
        <form id="crud-form" onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la chambre *
              </label>
              <input
                type="text"
                value={roomForm.name}
                onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={roomForm.description}
                onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par nuit (DH) *
                </label>
                <input
                  type="number"
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({...roomForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité *
                </label>
                <select
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="1">1 personne</option>
                  <option value="2">2 personnes</option>
                  <option value="3">3 personnes</option>
                  <option value="4">4 personnes</option>
                  <option value="5">5+ personnes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({...roomForm, status: e.target.value as Room['status']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Occupée</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured-edit"
                checked={roomForm.featured}
                onChange={(e) => setRoomForm({...roomForm, featured: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="featured-edit" className="ml-2 block text-sm text-gray-900">
                Mettre en vedette
              </label>
            </div>

            {/* Téléchargement d'images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images de la chambre
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Cliquez ou glissez des images
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Affichage des images téléchargées */}
              {roomForm.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Images téléchargées ({roomForm.images.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {roomForm.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={img}
                            alt={`Image ${idx + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setRoomToDelete(null)
        }}
        onConfirm={confirmDelete}
        itemName="cette chambre"
        message="Toutes les données associées seront également supprimées. Cette action est irréversible."
      />
      </div>
    </div>
  )
}
