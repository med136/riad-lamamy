'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, DollarSign, Plus, Search } from 'lucide-react'

type AdminService = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  duration_minutes: number | null
  is_active: boolean
  display_order: number
}

type EditDraft = {
  price?: number
  duration_minutes?: number | null
  is_active?: boolean
  description?: string
}

type CreateDraft = {
  name: string
  category: string
  price: number
  duration_minutes?: number | null
  is_active?: boolean
  description?: string
}

const CURRENCY = 'DH'

export default function ServicesPage() {
  const [services, setServices] = useState<AdminService[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft>({})

  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState<CreateDraft>({
    name: '',
    category: 'restauration',
    price: 0,
    duration_minutes: null,
    is_active: true,
    description: '',
  })
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/admin/services', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Erreur de chargement')
        setServices(json.services || [])
      } catch (e: any) {
        setError(e?.message || 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return services
    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(q) ||
        (service.category?.toLowerCase().includes(q) ?? false) ||
        (service.description?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [services, query])

  const stats = useMemo(() => {
    const activeCount = services.filter((service) => service.is_active).length
    const avgPrice = services.length
      ? Math.round(services.reduce((sum, service) => sum + (service.price || 0), 0) / services.length)
      : 0
    const avgDuration = services.length
      ? Math.round(
          services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0) / services.length
        )
      : 0
    return { activeCount, avgPrice, avgDuration }
  }, [services])

  const resetCreateDraft = () => {
    setCreateDraft({
      name: '',
      category: 'restauration',
      price: 0,
      duration_minutes: null,
      is_active: true,
      description: '',
    })
  }

  const startEdit = (serviceId: string) => {
    setEditingId(serviceId)
    setEditDraft({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft({})
  }

  const saveEdit = async (service: AdminService) => {
    try {
      setError(null)
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: editDraft.price ?? service.price,
          duration_minutes: editDraft.duration_minutes ?? service.duration_minutes,
          is_active: editDraft.is_active ?? service.is_active,
          description: editDraft.description ?? service.description,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Échec de mise à jour')
      setServices((prev) => prev.map((s) => (s.id === service.id ? json.service : s)))
      cancelEdit()
    } catch (e: any) {
      setError(e?.message || 'Erreur inconnue')
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Supprimer ce service ?')) return
    try {
      setError(null)
      const res = await fetch(`/api/admin/services/${serviceId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Échec de suppression')
      setServices((prev) => prev.filter((s) => s.id !== serviceId))
    } catch (e: any) {
      setError(e?.message || 'Erreur inconnue')
    }
  }

  const createService = async () => {
    const name = createDraft.name.trim()
    if (!name) {
      setError('Veuillez renseigner un nom de service.')
      return
    }

    try {
      setCreateLoading(true)
      setError(null)
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: createDraft.category,
          price: createDraft.price,
          duration_minutes: createDraft.duration_minutes ?? null,
          description: createDraft.description ?? '',
          is_active: createDraft.is_active ?? true,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Échec de création')
      setServices((prev) => [json.service, ...prev])
      setCreating(false)
      resetCreateDraft()
    } catch (e: any) {
      setError(e?.message || 'Erreur inconnue')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
        <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Services</p>
              <h1 className="text-3xl font-semibold text-gray-900">Services complémentaires</h1>
              <p className="text-sm text-gray-600">Gérez les services proposés aux clients.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
              onClick={() => setCreating((v) => !v)}
            >
              <Plus size={16} />
              {creating ? 'Fermer' : 'Ajouter un service'}
            </button>
          </div>
        </div>

        {creating ? (
          <div className="rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Nouveau service</h2>
              <button
                type="button"
                className="text-xs font-semibold text-gray-700 hover:text-gray-900"
                onClick={() => {
                  setCreating(false)
                  resetCreateDraft()
                }}
              >
                Réinitialiser
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 text-xs text-gray-600">
                <span className="text-xs font-semibold text-gray-700">Nom *</span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                  value={createDraft.name}
                  onChange={(e) => setCreateDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Ex: Hammam traditionnel"
                />
              </label>

              <label className="space-y-2 text-xs text-gray-600">
                <span className="text-xs font-semibold text-gray-700">Catégorie</span>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                  value={createDraft.category}
                  onChange={(e) => setCreateDraft((d) => ({ ...d, category: e.target.value }))}
                >
                  <option value="restauration">Restauration</option>
                  <option value="spa">Spa</option>
                  <option value="transport">Transport</option>
                  <option value="activite">Activité</option>
                  <option value="sur_mesure">Sur mesure</option>
                </select>
              </label>

              <label className="space-y-2 text-xs text-gray-600">
                <span className="text-xs font-semibold text-gray-700">Prix ({CURRENCY})</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                  value={createDraft.price}
                  onChange={(e) => setCreateDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                />
              </label>

              <label className="space-y-2 text-xs text-gray-600">
                <span className="text-xs font-semibold text-gray-700">Durée (min)</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                  value={createDraft.duration_minutes ?? ''}
                  onChange={(e) =>
                    setCreateDraft((d) => ({
                      ...d,
                      duration_minutes: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label className="space-y-2 text-xs text-gray-600 md:col-span-2">
                <span className="text-xs font-semibold text-gray-700">Description</span>
                <textarea
                  className="h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                  value={createDraft.description ?? ''}
                  onChange={(e) => setCreateDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Détails, inclusions, conditions..."
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-amber-600"
                  checked={createDraft.is_active ?? true}
                  onChange={(e) => setCreateDraft((d) => ({ ...d, is_active: e.target.checked }))}
                />
                Actif
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-amber-200/70 bg-white px-5 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-amber-50"
                onClick={() => setCreating(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={createLoading}
                className="rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={createService}
              >
                {createLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Services actifs</p>
                <p className="text-2xl font-bold mt-2">{stats.activeCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Prix moyen</p>
                <p className="text-2xl font-bold mt-2">
                  {stats.avgPrice} {CURRENCY}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100">
                <DollarSign className="text-amber-700" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Durée moyenne</p>
                <p className="text-2xl font-bold mt-2">{stats.avgDuration} min</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un service..."
            className="w-full rounded-full border border-amber-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-gray-800 placeholder:text-amber-300 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Chargement des services...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => {
            const isEditing = editingId === service.id
            return (
              <div
                key={service.id}
                className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-medium text-gray-900">{service.name}</h3>
                    {service.category ? (
                      <p className="mt-1 text-xs text-gray-500 capitalize">{service.category}</p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                      service.is_active
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
                        : 'bg-rose-50 text-rose-700 ring-rose-200/70'
                    }`}
                  >
                    {service.is_active ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={18} />
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                        value={editDraft.price ?? service.price}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, price: Number(e.target.value) }))
                        }
                      />
                    </label>

                    <label className="flex items-center gap-2 text-gray-600">
                      <Clock size={18} />
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                        value={(editDraft.duration_minutes ?? service.duration_minutes ?? 0) as number}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, duration_minutes: Number(e.target.value) }))
                        }
                      />
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-amber-600"
                        checked={editDraft.is_active ?? service.is_active}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, is_active: e.target.checked }))
                        }
                      />
                      Actif
                    </label>

                    <textarea
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                      placeholder="Description"
                      value={editDraft.description ?? service.description ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, description: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={18} className="mr-2" />
                      <span className="font-medium">
                        {service.price} {CURRENCY}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock size={18} className="mr-2" />
                      <span>{service.duration_minutes ?? 0} minutes</span>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                  {service.description || '—'}
                </p>

                <div className="mt-5 flex justify-between gap-3">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="rounded-full border border-amber-200/70 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-amber-50"
                        onClick={cancelEdit}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
                        onClick={() => saveEdit(service)}
                      >
                        Sauvegarder
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-amber-50"
                        onClick={() => startEdit(service.id)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                        onClick={() => deleteService(service.id)}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {!loading && !error && filtered.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden">
              <div className="px-6 py-10 text-center text-sm text-gray-600">
                Aucun service trouvé.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
