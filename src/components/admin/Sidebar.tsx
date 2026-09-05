'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bed,
  Bell,
  Calendar,
  ChevronDown,
  Home,
  Image,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
  Settings,
  Star,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { signOut } from '@/lib/supabase/client'

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/admin/contenu', icon: PanelsTopLeft, label: 'Contenu du site' },
  { href: '/admin/traductions', icon: Languages, label: 'Traductions' },
  { href: '/admin/chambres', icon: Bed, label: 'Chambres' },
  { href: '/admin/reservations', icon: Calendar, label: 'Réservations' },
  { href: '/admin/galerie', icon: Image, label: 'Galerie' },
  { href: '/admin/services', icon: Wrench, label: 'Services' },
  { href: '/admin/temoignages', icon: Star, label: 'Témoignages' },
  { href: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
]

const settingsSubmenu = [
  { href: '/admin/parametres', icon: Settings, label: 'Général' },
  { href: '/admin/parametres/hero', icon: Home, label: 'Section Hero' },
]

function isPathActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/admin/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [reservationCount, setReservationCount] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    pathname?.startsWith('/admin/parametres') || false,
  )
  const [adminLogoUrl, setAdminLogoUrl] = useState('/logo-mark.png')

  useEffect(() => {
    const fetchReservationCount = async () => {
      try {
        const res = await fetch('/api/reservations')
        const json = await res.json()
        if (res.ok && Array.isArray(json.reservations)) {
          const pendingCount = json.reservations.filter(
            (r: { status?: string }) => r.status === 'pending',
          ).length
          setReservationCount(pendingCount)
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des réservations:', err)
      }
    }

    void fetchReservationCount()
    const interval = window.setInterval(fetchReservationCount, 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchAdminLogo = async () => {
      try {
        const res = await fetch('/api/admin/settings?key=admin_logo_url')
        if (!res.ok) return

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

        if (nextUrl?.trim()) setAdminLogoUrl(nextUrl.trim())
      } catch (err) {
        console.error('Erreur lors du chargement du logo admin:', err)
      }
    }

    void fetchAdminLogo()
  }, [])

  if (pathname?.startsWith('/admin/login')) return null

  return (
    <>
      <button
        type="button"
        aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setIsMobileMenuOpen((current) => !current)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B28A47]/25 bg-[#FFFDF8] text-[#0F5A46] shadow-[0_12px_30px_-20px_rgba(43,28,23,.5)] lg:hidden"
      >
        {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-[#17130F]/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[278px] flex-col
          border-r border-[#D2AA5A]/15
          bg-[linear-gradient(180deg,#0B4A3A_0%,#083D31_52%,#06352B_100%)]
          text-[#FFFDF8]
          shadow-[24px_0_70px_-50px_rgba(6,63,51,.75)]
          transition-transform duration-300 lg:static lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="border-b border-white/8 px-5 py-5">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] border border-[#D2AA5A]/20 bg-[#FFFDF8]/[0.07] p-2">
              <img
                src={adminLogoUrl}
                alt="Dar LaMamy"
                className="h-full w-full object-contain"
              />
            </span>

            <span className="min-w-0">
              <span className="block font-serif text-[22px] font-medium leading-none tracking-[0.02em] text-[#FFFDF8]">
                Dar LaMamy
              </span>
              <span className="mt-2 block text-[8px] font-semibold uppercase tracking-[0.28em] text-[#D2AA5A]">
                Administration
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/35">
            Gestion
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isPathActive(pathname, item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex min-h-[46px] items-center gap-3 rounded-[14px] px-3 text-[12px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#FFFDF8] text-[#0F5A46] shadow-[0_12px_28px_-20px_rgba(0,0,0,.55)]'
                      : 'text-white/72 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition ${
                      isActive
                        ? 'bg-[#0F5A46]/8 text-[#0F5A46]'
                        : 'bg-white/[0.06] text-[#D2AA5A] group-hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.6} />
                  </span>

                  <span className="truncate">{item.label}</span>

                  {item.href === '/admin/reservations' && reservationCount > 0 && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isActive
                          ? 'bg-[#D2AA5A]/15 text-[#B28A47]'
                          : 'bg-[#D2AA5A]/15 text-[#F2D390]'
                      }`}
                    >
                      {reservationCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="my-4 h-px bg-white/[0.07]" />

          <p className="px-3 pb-2 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/35">
            Configuration
          </p>

          <button
            type="button"
            onClick={() => setIsSettingsOpen((current) => !current)}
            className={`flex min-h-[46px] w-full items-center gap-3 rounded-[14px] px-3 text-[12px] font-medium transition-all ${
              pathname?.startsWith('/admin/parametres')
                ? 'bg-white/[0.08] text-white'
                : 'text-white/72 hover:bg-white/[0.07] hover:text-white'
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/[0.06] text-[#D2AA5A]">
              <Settings size={16} strokeWidth={1.6} />
            </span>
            <span>Paramètres</span>
            <ChevronDown
              size={14}
              className={`ml-auto transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isSettingsOpen && (
            <div className="ml-[42px] mt-1 space-y-1 border-l border-white/10 pl-3">
              {settingsSubmenu.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-[11px] transition ${
                      isActive
                        ? 'bg-[#FFFDF8] text-[#0F5A46]'
                        : 'text-white/58 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Icon size={13} strokeWidth={1.6} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.05] p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D2AA5A]/25 bg-[#D2AA5A]/10 text-[10px] font-bold text-[#F4D99E]">
              AD
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-white">Administrateur</p>
              <p className="mt-0.5 text-[9px] text-white/42">Super Admin</p>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              <Bell size={15} strokeWidth={1.6} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] text-[11px] font-semibold text-white/75 transition hover:border-[#D2AA5A]/30 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={14} strokeWidth={1.6} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
