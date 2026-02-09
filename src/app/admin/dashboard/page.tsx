'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Calendar, DollarSign, 
  Bed, Star, Clock, Package,
  ArrowUp, ArrowDown, Eye, Edit, Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// Composant StatCard réutilisable
const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover-lift">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <div className="flex items-center mt-1">
          {change > 0 ? (
            <>
              <ArrowUp size={14} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">{change}%</span>
            </>
          ) : (
            <>
              <ArrowDown size={14} className="text-red-500 mr-1" />
              <span className="text-sm text-red-600">{Math.abs(change)}%</span>
            </>
          )}
          <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
  </div>
)

export default function DashboardPage() {
  const router = useRouter()

  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [roomsTotal, setRoomsTotal] = useState<number | null>(null)
  const [roomsOccupied, setRoomsOccupied] = useState<number | null>(null)
  const [bookingsThisMonth, setBookingsThisMonth] = useState<number | null>(null)
  const [revenueThisMonth, setRevenueThisMonth] = useState<number | null>(null)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [recentReservationsData, setRecentReservationsData] = useState<any[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true)
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch stats')
        const data = await res.json()
        setUsersCount(data.usersCount ?? 0)
        setRoomsTotal(data.roomsTotal ?? 0)
        setRoomsOccupied(data.roomsOccupied ?? 0)
        setBookingsThisMonth(data.bookingsThisMonth ?? 0)
        setRevenueThisMonth(data.revenueThisMonth ?? 0)
        setAvgRating(data.avgRating ?? null)
        setRecentReservationsData(data.recentReservations ?? [])
      } catch (err: any) {
        console.error('Failed to load stats', err)
        setStatsError(err?.message || 'Erreur lors du chargement des statistiques')
        toast.error('Impossible de charger les statistiques')
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStats()
  }, [])

  // Données statistiques
  const stats = [
    {
      title: 'Utilisateurs',
      value: usersCount ?? 0,
      change: 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Chambres totales',
      value: roomsTotal ?? 0,
      change: 0,
      icon: Bed,
      color: 'blue'
    },
    {
      title: 'Chambres occupées',
      value: roomsOccupied ?? 0,
      change: 0,
      icon: Bed,
      color: 'green'
    },
    {
      title: 'Réservations ce mois',
      value: bookingsThisMonth ?? 0,
      change: 0,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Revenu mensuel',
      value: revenueThisMonth ? revenueThisMonth.toLocaleString() + ' DH' : '0 DH',
      change: 0,
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Taux satisfaction',
      value: avgRating ? avgRating.toFixed(1) + '/5' : '—',
      change: 0,
      icon: Star,
      color: 'yellow'
    }
  ]

  // Réservations récentes
  const recentReservations = [
    { id: 101, guest: 'Marie Dubois', room: 'Suite Royale', checkIn: '2024-01-15', status: 'Confirmée' },
    { id: 102, guest: 'Ahmed Alami', room: 'Chambre Deluxe', checkIn: '2024-01-16', status: 'En attente' },
    { id: 103, guest: 'John Smith', room: 'Suite Familiale', checkIn: '2024-01-17', status: 'Confirmée' },
    { id: 104, guest: 'Sophie Martin', room: 'Suite Royale', checkIn: '2024-01-18', status: 'Annulée' },
  ]

  // Actions rapides
  const quickActions = [
    {
      title: 'Ajouter une chambre',
      description: 'Créer une nouvelle chambre',
      icon: Bed,
      color: 'blue',
      action: () => router.push('/admin/chambres?action=add')
    },
    {
      title: 'Nouvelle réservation',
      description: 'Créer une réservation manuelle',
      icon: Calendar,
      color: 'green',
      action: () => router.push('/admin/reservations?action=add')
    },
    {
      title: 'Galerie photos',
      description: 'Ajouter des photos',
      icon: Package,
      color: 'purple',
      action: () => router.push('/admin/galerie?action=add')
    },
    {
      title: 'Voir témoignages',
      description: 'Modérer les avis',
      icon: Star,
      color: 'yellow',
      action: () => router.push('/admin/temoignages')
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Dashboard</p>
          <h1 className="text-3xl font-semibold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-600">Synthese temps reel et activite recente.</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Réservations récentes */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Réservations récentes</h2>
              <p className="text-sm text-gray-500">Les 4 dernières réservations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-100">
                <thead className="bg-amber-50/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">ID</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Client</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Chambre</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Arrivée</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Statut</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {(recentReservationsData.length ? recentReservationsData : recentReservations).map((res: any) => (
                    <tr key={res.id} className="hover:bg-amber-50/40">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm">#{res.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{res.guest_name || res.guest}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{res.room_name || res.room || res.room_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{res.check_in || res.checkIn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                          res.status === 'Confirmée' || res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70' :
                          res.status === 'En attente' || res.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-200/70' :
                          'bg-rose-50 text-rose-700 ring-rose-200/70'
                        }`}>
                          {res.status || res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/admin/reservations?edit=${res.id}`)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => router.push(`/admin/reservations?edit=${res.id}`)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button 
                onClick={() => router.push('/admin/reservations')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir toutes les réservations →
              </button>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
              <p className="text-sm text-gray-500">Accès rapide aux fonctionnalités</p>
            </div>
            <div className="p-6 space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-amber-50/40 transition-colors"
                >
                  <div className={`p-3 rounded-lg bg-${action.color}-100 mr-4`}>
                    <action.icon className={`text-${action.color}-600`} size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notification d'activité */}
          <div className="mt-6 rounded-3xl border border-amber-100 bg-white/90 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Users size={16} className="text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Nouveau client inscrit</p>
                    <p className="text-sm text-gray-500">Marie Dubois</p>
                    <p className="text-xs text-gray-400">Il y a 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Nouvelle réservation</p>
                    <p className="text-sm text-gray-500">Suite Royale - #105</p>
                    <p className="text-xs text-gray-400">Il y a 1 heure</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Star size={16} className="text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Nouveau témoignage</p>
                    <p className="text-sm text-gray-500">Note: 5/5</p>
                    <p className="text-xs text-gray-400">Il y a 2 heures</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
