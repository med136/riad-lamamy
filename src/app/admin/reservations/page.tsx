'use client'

import { useState, useEffect } from 'react'
import { Calendar, Search, Edit, Trash2, CheckCircle, XCircle, Clock, Plus, Loader, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Reservation } from '@/types'

// Interface local avec les champs de l'API
interface ReservationForm {
  guest_name: string
  guest_email: string
  guest_phone: string
  room_id: string
  check_in: string
  check_out: string
  guest_count: string
  total_amount: string
  paid_amount: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  special_requests: string
  admin_notes: string
}

export default function ReservationsPage() {
  // Interface pour les chambres
  interface Room {
    id: string
    name: string
    price: number
    max_guests: number
  }

  // États
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [form, setForm] = useState<ReservationForm>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    room_id: '',
    check_in: '',
    check_out: '',
    guest_count: '1',
    total_amount: '',
    paid_amount: '',
    status: 'pending',
    special_requests: '',
    admin_notes: ''
  })

  // Charger les réservations et les chambres
  useEffect(() => {
    fetchReservations()
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (!response.ok) throw new Error('Erreur lors du chargement des chambres')
      const data = await response.json()
      const fetchedRooms = Array.isArray(data) ? data : (data?.rooms ?? [])
      const normalized: Room[] = (fetchedRooms || []).map((r: any) => ({
        id: String(r.id),
        name: r.name,
        price: Number(r.base_price ?? r.price ?? 0),
        max_guests: Number(r.max_guests ?? r.capacity ?? 2)
      }))
      setRooms(normalized)
    } catch (error: any) {
      console.error('Erreur:', error)
    }
  }

  const fetchReservations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reservations?limit=100')
      if (!response.ok) throw new Error('Erreur lors du chargement')
      const data = await response.json()
      setReservations(data.reservations || [])
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des réservations')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer les réservations
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      res.guest_email.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Gestion de l'ajout
  const handleAdd = () => {
    setShowModal(true)
    setEditingId(null)
    setForm({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      room_id: '',
      check_in: '',
      check_out: '',
      guest_count: '1',
      total_amount: '',
      paid_amount: '0',
      status: 'pending',
      special_requests: '',
      admin_notes: ''
    })
  }

  // Gestion de l'édition
  const handleEdit = (res: Reservation) => {
    setEditingId(res.id)
    setForm({
      guest_name: res.guest_name,
      guest_email: res.guest_email,
      guest_phone: res.guest_phone || '',
      room_id: res.room_id || '',
      check_in: res.check_in,
      check_out: res.check_out,
      guest_count: res.guest_count.toString(),
      total_amount: res.total_amount.toString(),
      paid_amount: res.paid_amount.toString(),
      status: res.status,
      special_requests: res.special_requests || '',
      admin_notes: res.admin_notes || ''
    })
    setShowModal(true)
  }

  // Gestion de la suppression
  const handleDelete = (id: string) => {
    setReservationToDelete(id)
  }

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (reservationToDelete) {
      setIsSaving(true)
      try {
        const response = await fetch(`/api/reservations/${reservationToDelete}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Erreur lors de la suppression')
        setReservations(reservations.filter(res => res.id !== reservationToDelete))
        toast.success('Réservation supprimée avec succès')
        setReservationToDelete(null)
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la suppression')
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Sauvegarder
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const requiredFields = ['guest_name', 'guest_email', 'room_id', 'check_in', 'check_out', 'total_amount']
    for (const field of requiredFields) {
      if (!form[field as keyof ReservationForm]) {
        toast.error(`Le champ ${field} est obligatoire`)
        return
      }
    }

    setIsSaving(true)
    try {
      const payload = {
        ...form,
        guest_count: parseInt(form.guest_count),
        total_amount: parseFloat(form.total_amount),
        paid_amount: parseFloat(form.paid_amount || '0')
      }

      if (editingId) {
        // Édition
        const response = await fetch(`/api/reservations/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) throw new Error('Erreur lors de la modification')
        const updated = await response.json()
        setReservations(reservations.map(res => res.id === updated.id ? updated : res))
        toast.success('Réservation modifiée avec succès')
        setShowModal(false)
      } else {
        // Ajout
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erreur lors de la création')
        }
        const newRes = await response.json()
        setReservations([...reservations, newRes])
        toast.success('Réservation ajoutée avec succès')
        setShowModal(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  // Fonctions utilitaires
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
      case 'pending': return 'bg-amber-50 text-amber-700 ring-amber-200/70'
      case 'completed': return 'bg-blue-50 text-blue-700 ring-blue-200/70'
      case 'cancelled': return 'bg-rose-50 text-rose-700 ring-rose-200/70'
      default: return 'bg-gray-100 text-gray-700 ring-gray-200/70'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />
      case 'pending': return <Clock size={16} />
      case 'completed': return <CheckCircle size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée'
      case 'pending': return 'En attente'
      case 'completed': return 'Terminée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Reservations</p>
            <h1 className="text-3xl font-semibold text-gray-900">Gestion des reservations</h1>
            <p className="text-sm text-gray-600">Consultez et gerez toutes les reservations.</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
          >
            <Plus size={16} />
            Nouvelle reservation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold mt-2">{reservations.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmées</p>
              <p className="text-2xl font-bold mt-2">
                {reservations.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold mt-2">
                {reservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenu total</p>
              <p className="text-2xl font-bold mt-2">
                {reservations.reduce((acc, r) => acc + r.total_amount, 0).toLocaleString()} DH
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <div className="text-purple-600">💰</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-amber-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-gray-800 placeholder:text-amber-300 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition ${statusFilter === 'all' ? 'bg-amber-600 text-white' : 'border border-amber-200/70 text-amber-700 hover:bg-amber-50'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition ${statusFilter === 'confirmed' ? 'bg-emerald-600 text-white' : 'border border-amber-200/70 text-amber-700 hover:bg-amber-50'}`}
          >
            Confirmées
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'border border-amber-200/70 text-amber-700 hover:bg-amber-50'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition ${statusFilter === 'cancelled' ? 'bg-rose-600 text-white' : 'border border-amber-200/70 text-amber-700 hover:bg-amber-50'}`}
          >
            Annulées
          </button>
        </div>
      </div>

      {/* Table des réservations */}
      <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-amber-50/70">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Référence</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Client</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Dates</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Montant</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Statut</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-amber-50/40">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-medium text-gray-900">{res.reference}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{res.guest_name}</div>
                    <div className="text-sm text-gray-500">{res.guest_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{res.check_in}</div>
                      <div className="text-gray-500">à {res.check_out}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {res.total_amount.toLocaleString()} DH
                    </div>
                    <div className="text-sm text-gray-500">
                      Payé: {res.paid_amount.toLocaleString()} DH
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusColor(res.status)}`}>
                      {getStatusIcon(res.status)}
                      <span className="ml-2">{getStatusLabel(res.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(res)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingId ? 'Éditer la réservation' : 'Ajouter une réservation'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nom du client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input 
                    type="text" 
                    value={form.guest_name} 
                    onChange={(e) => setForm({...form, guest_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={form.guest_email} 
                    onChange={(e) => setForm({...form, guest_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    value={form.guest_phone || ''} 
                    onChange={(e) => setForm({...form, guest_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Chambre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
                  <select 
                    value={form.room_id || ''} 
                    onChange={(e) => setForm({...form, room_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une chambre</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.max_guests} personnes) - {room.price} MAD/nuit
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({...form, status: e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                {/* Nombre de clients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de clients</label>
                  <input 
                    type="number" 
                    min="1"
                    value={form.guest_count || 1} 
                    onChange={(e) => setForm({...form, guest_count: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date d'arrivée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                  <input 
                    type="date" 
                    value={form.check_in} 
                    onChange={(e) => setForm({...form, check_in: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Date de départ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                  <input 
                    type="date" 
                    value={form.check_out} 
                    onChange={(e) => setForm({...form, check_out: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Montant total */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant total (DH)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.total_amount || 0} 
                    onChange={(e) => setForm({...form, total_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Montant payé */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant payé (DH)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.paid_amount || 0} 
                    onChange={(e) => setForm({...form, paid_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Demandes spéciales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demandes spéciales</label>
                <textarea 
                  value={form.special_requests || ''} 
                  onChange={(e) => setForm({...form, special_requests: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              {/* Notes admin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes admin</label>
                <textarea 
                  value={form.admin_notes || ''} 
                  onChange={(e) => setForm({...form, admin_notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {reservationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Supprimer la réservation</h3>
            <p className="text-gray-600 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer cette réservation? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setReservationToDelete(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
