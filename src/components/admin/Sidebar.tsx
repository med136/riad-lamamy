'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bed,
  Calendar,
  Image,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Star,
  Wrench,
  Bell,
  ChevronDown,
  Home
} from 'lucide-react'
import { signOut } from '@/lib/supabase/client'

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/admin/chambres', icon: Bed, label: 'Chambres' },
  { href: '/admin/reservations', icon: Calendar, label: 'Réservations' },
  { href: '/admin/galerie', icon: Image, label: 'Galerie' },
  { href: '/admin/services', icon: Wrench, label: 'Services' },
  { href: '/admin/temoignages', icon: Star, label: 'Témoignages' },
  { href: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
]

const settingsSubmenu = [
  { href: '/admin/parametres', icon: Settings, label: 'General' },
  { href: '/admin/parametres/hero', icon: Home, label: 'Section Hero' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [reservationCount, setReservationCount] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    pathname?.startsWith('/admin/parametres') || false
  )
  const [adminLogoUrl, setAdminLogoUrl] = useState('/logo.svg')


  // Récupérer le nombre de réservations En attente
  useEffect(() => {
    const fetchReservationCount = async () => {
      try {
        const res = await fetch('/api/reservations')
        const json = await res.json()
        if (res.ok && Array.isArray(json.reservations)) {
          // Filtrer seulement les réservations avec le statut "pending" (En attente)
          const pendingCount = json.reservations.filter((r: any) => r.status === 'pending').length
          setReservationCount(pendingCount)
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des réservations:', err)
      }
    }
    
    fetchReservationCount()
    // Actualiser tous les 30 secondes
    const interval = setInterval(fetchReservationCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Charger le logo admin depuis les paramètres
  useEffect(() => {
    const fetchAdminLogo = async () => {
      try {
        const res = await fetch('/api/admin/settings?key=admin_logo_url')
        if (res.ok) {
          const data = await res.json()
          let nextUrl: string | null = null

          if (typeof data?.value === 'string') {
            nextUrl = data.value
          } else if (data?.value && typeof data.value === 'object' && 'url' in data.value) {
            nextUrl = (data.value as { url?: string }).url ?? null
          } else if (typeof data?.admin_logo_url === 'string') {
            nextUrl = data.admin_logo_url
          } else if (typeof data?.admin_logo === 'string') {
            nextUrl = data.admin_logo
          }

          if (nextUrl) {
            setAdminLogoUrl(nextUrl)
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du logo admin:', err)
      }
    }

    fetchAdminLogo()
  }, [])

  // Ne pas afficher le sidebar sur la page de login admin
  if (pathname?.startsWith('/admin/login')) return null

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-full border border-amber-200/60 bg-white/90 p-2 text-amber-700 shadow-lg backdrop-blur"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-gradient-to-b from-[#111111] via-[#1f1b16] to-[#2d2419] text-white
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300
        flex flex-col border-r border-amber-200/10
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-amber-200/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl border border-amber-200/20 bg-white/5 p-2 flex items-center justify-center">
              <img
                src={adminLogoUrl}
                alt="Riad Dar Al Andalus - Admin"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">Control</p>
              <h1 className="text-xl font-semibold text-white">Riad Admin</h1>
              <p className="text-sm text-amber-100/60">Dar Al Andalus</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-lg ring-1 ring-amber-200/30' 
                    : 'text-amber-100/70 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border border-transparent ${
                  isActive ? 'bg-amber-400/20 border-amber-200/30' : 'bg-white/5 group-hover:border-amber-200/20'
                }`}>
                  <item.icon size={18} />
                </span>
                <span className="font-medium">{item.label}</span>
                {item.label === 'R?servations' && reservationCount > 0 && (
                  <span className="ml-auto rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-100">
                    {reservationCount}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Menu Paramètres avec sous-menu */}
          <div>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all
                ${pathname?.startsWith('/admin/parametres')
                  ? 'bg-white/10 text-white shadow-lg ring-1 ring-amber-200/30' 
                  : 'text-amber-100/70 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border border-transparent ${
                  pathname?.startsWith('/admin/parametres')
                    ? 'bg-amber-400/20 border-amber-200/30'
                    : 'bg-white/5'
                }`}>
                  <Settings size={18} />
                </span>
                <span className="font-medium">Parametres</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Sous-menu */}
            {isSettingsOpen && (
              <div className="ml-6 mt-2 space-y-2">
                {settingsSubmenu.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-2 rounded-xl transition-all text-sm
                        ${isActive 
                          ? 'bg-amber-400/20 text-white' 
                          : 'text-amber-100/60 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-amber-200/10">
          <div className="flex items-center space-x-3 mb-4 rounded-2xl border border-white/5 bg-white/5 px-3 py-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-100">
              <span className="font-bold">AD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Administrateur</p>
              <p className="text-sm text-amber-100/60">Super Admin</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-xl text-amber-100/70">
              <Bell size={18} />
            </button>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                     bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
