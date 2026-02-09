'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, Search, Filter, Plus } from 'lucide-react'
import Modal from '@/components/admin/crud/Modal'
import DeleteConfirmation from '@/components/admin/crud/DeleteConfirmation'
import toast from 'react-hot-toast' 

const initialTestimonials = [] as any[]

export default function TemoignagesPage() {
  const [filter, setFilter] = useState('all')

  const [testimonials, setTestimonials] = useState<any[]>(initialTestimonials)

  const [search, setSearch] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null)
  const [testimonialForm, setTestimonialForm] = useState({ name: '', country: '', rating: 5, content: '', featured: false })

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams()
        if (filter === 'pending') params.set('approved', 'false')
        if (filter === 'featured') params.set('featured', 'true')
        if (search.trim()) params.set('search', search.trim())
        params.set('limit', '50')
        const res = await fetch(`/api/admin/testimonials?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load testimonials')
        const { data } = await res.json()
        const mapped = (data || []).map((t: any) => ({
          id: t.id,
          name: t.guest_name,
          country: t.guest_country,
          rating: t.rating,
          content: t.content,
          approved: !!t.approved,
          featured: !!t.featured,
        }))
        setTestimonials(mapped)
      } catch (e) {
        toast.error('Impossible de charger les témoignages')
      }
    }
    load()
  }, [filter, search])

  const filteredTestimonials = testimonials

  const avgRating = testimonials.length ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '0.0'

  const approve = (id: number) => {
    fetch(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true })
    }).then(async (res) => {
      if (!res.ok) throw new Error('Approve failed')
      const { data } = await res.json()
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: true } : t))
      toast.success('Témoignage approuvé')
    }).catch(() => toast.error('Erreur lors de l\'approbation'))
  }

  const reject = (id: number) => {
    fetch(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: false })
    }).then(async (res) => {
      if (!res.ok) throw new Error('Reject failed')
      const { data } = await res.json()
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: false } : t))
      toast.success('Témoignage rejeté')
    }).catch(() => toast.error('Erreur lors du rejet'))
  }

  const toggleFeatured = (id: number) => {
    const current = testimonials.find(t => t.id === id)
    const next = current ? !current.featured : true
    fetch(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: next })
    }).then(async (res) => {
      if (!res.ok) throw new Error('Toggle failed')
      const { data } = await res.json()
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: next } : t))
      toast.success('Mise en avant mise à jour')
    }).catch(() => toast.error('Erreur lors de la mise en avant'))
  }

  const openEdit = (t: any) => {
    setSelectedTestimonial(t)
    setTestimonialForm({ name: t.name, country: t.country || '', rating: t.rating || 5, content: t.content || '', featured: !!t.featured })
    setIsEditModalOpen(true)
  }

  const openAdd = () => {
    setSelectedTestimonial(null)
    setTestimonialForm({ name: '', country: '', rating: 5, content: '', featured: false })
    setIsEditModalOpen(true)
  }

  const saveTestimonial = (e: React.FormEvent) => {
    e.preventDefault()
    const name = testimonialForm.name.trim()
    const content = testimonialForm.content.trim()
    const rating = Number(testimonialForm.rating)

    if (!name) { toast.error('Le nom est requis'); return }
    if (!content) { toast.error('Le témoignage est requis'); return }
    if (!rating || rating < 1 || rating > 5) { toast.error('La note doit être entre 1 et 5'); return }

    if (selectedTestimonial) {
      fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: name,
          guest_country: testimonialForm.country || null,
          rating,
          content,
          featured: testimonialForm.featured,
        })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Update failed')
        const { data } = await res.json()
        setTestimonials(prev => prev.map(t => t.id === selectedTestimonial.id ? { ...t, ...testimonialForm } : t))
        toast.success('Témoignage modifié')
        setIsEditModalOpen(false)
      }).catch(() => toast.error('Erreur lors de la modification'))
    } else {
      fetch(`/api/admin/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: name,
          guest_country: testimonialForm.country || null,
          rating,
          content,
          featured: testimonialForm.featured,
          approved: false,
        })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Create failed')
        const { data } = await res.json()
        const newTestimonial = { id: data.id, ...testimonialForm, approved: !!data.approved }
        setTestimonials(prev => [newTestimonial, ...prev])
        toast.success('Témoignage ajouté')
        setIsEditModalOpen(false)
      }).catch(() => toast.error('Erreur lors de l\'ajout'))
    }
  }

  const confirmDelete = () => {
    if (!testimonialToDelete) return
    fetch(`/api/admin/testimonials/${testimonialToDelete}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed')
        setTestimonials(prev => prev.filter(t => t.id !== testimonialToDelete))
        setIsDeleteModalOpen(false)
        setTestimonialToDelete(null)
        toast.success('Témoignage supprimé')
      })
      .catch(() => toast.error('Erreur lors de la suppression'))
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-amber-500 fill-amber-500' : 'text-amber-100'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Témoignages</p>
            <h1 className="text-3xl font-semibold text-gray-900">Témoignages clients</h1>
            <p className="text-sm text-gray-600">Modérez les avis des clients.</p>
          </div>
          <button
            onClick={openAdd}
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
          >
            <Plus size={16} />
            Ajouter un témoignage
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total témoignages</p>
              <p className="text-2xl font-bold mt-2">{testimonials.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-blue-600">💬</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold mt-2">{testimonials.filter(t => !t.approved).length}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <div className="text-yellow-600">⏳</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Note moyenne</p>
              <p className="text-2xl font-bold mt-2">{avgRating}/5</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <Star className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un témoignage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-amber-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-gray-800 placeholder:text-amber-300 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filter === 'all' ? 'bg-gray-900 text-white shadow' : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filter === 'pending' ? 'bg-gray-900 text-white shadow' : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filter === 'featured' ? 'bg-gray-900 text-white shadow' : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'}`}
          >
            Mis en avant
          </button>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-amber-50 transition">
          <Filter size={16} />
          Trier
        </button>
      </div>

      {/* Testimonials list */}
      <div className="space-y-4">
        {filteredTestimonials.length === 0 ? (
          <div className="rounded-3xl border border-amber-100 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Aucun témoignage trouvé</p>
            <p className="mt-1 text-sm text-gray-600">Essayez de modifier la recherche ou le filtre.</p>
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-base font-semibold text-gray-900">{testimonial.name}</h3>
                    {testimonial.country ? (
                      <span className="text-sm text-gray-500">{testimonial.country}</span>
                    ) : null}
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        testimonial.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {testimonial.approved ? 'Approuvé' : 'En attente'}
                    </span>
                    {testimonial.featured ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        ★ Mis en avant
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">{testimonial.content}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                  {!testimonial.approved ? (
                    <>
                      <button
                        onClick={() => approve(testimonial.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        type="button"
                      >
                        <Check size={16} />
                        Approuver
                      </button>
                      <button
                        onClick={() => reject(testimonial.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        type="button"
                      >
                        <X size={16} />
                        Rejeter
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => reject(testimonial.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      type="button"
                    >
                      <X size={16} />
                      Rejeter
                    </button>
                  )}

                  <button
                    onClick={() => toggleFeatured(testimonial.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      testimonial.featured
                        ? 'bg-amber-50 text-amber-800 shadow-sm'
                        : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
                    }`}
                    type="button"
                  >
                    {testimonial.featured ? 'Retirer la mise en avant' : 'Mettre en avant'}
                  </button>

                  <button
                    onClick={() => openEdit(testimonial)}
                    className="rounded-full border border-amber-200/70 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-amber-50 transition"
                    type="button"
                  >
                    Éditer
                  </button>

                  <button
                    onClick={() => { setTestimonialToDelete(testimonial.id); setIsDeleteModalOpen(true) }}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-red-700 hover:text-red-800"
                    type="button"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={selectedTestimonial ? `Modifier ${selectedTestimonial?.name}` : 'Ajouter un témoignage'} size="md">
          <form onSubmit={saveTestimonial}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <input
                  type="text"
                  value={testimonialForm.country}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, country: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={testimonialForm.rating}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Témoignage</label>
                <textarea
                  value={testimonialForm.content}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={testimonialForm.featured}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-400/40"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Mettre en avant</label>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setTestimonialToDelete(null) }}
        onConfirm={confirmDelete}
        itemName="ce témoignage"
        message="Cette suppression est irréversible."
      />
      </div>
    </div>
  )
}
