'use client'

import { Bell, ExternalLink, HelpCircle, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const routeTitles: Record<string, string> = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/contenu': 'Contenu du site',
  '/admin/traductions': 'Traductions',
  '/admin/chambres': 'Chambres',
  '/admin/reservations': 'Réservations',
  '/admin/galerie': 'Galerie',
  '/admin/services': 'Services',
  '/admin/temoignages': 'Témoignages',
  '/admin/utilisateurs': 'Utilisateurs',
  '/admin/parametres': 'Paramètres',
  '/admin/parametres/hero': 'Section Hero',
}

export default function AdminHeader() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  if (pathname?.startsWith('/admin/login')) return null

  const currentTitle =
    routeTitles[pathname || ''] ||
    (pathname?.startsWith('/admin/contenu/') ? 'Éditeur de page' : 'Administration')

  return (
    <header className="sticky top-0 z-30 border-b border-[#B28A47]/15 bg-[#FFFDF8]/95 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center gap-4 px-5 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1 pl-12 lg:pl-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#B28A47]">
            Administration
          </p>
          <h2 className="mt-0.5 truncate font-serif text-[22px] font-medium leading-none text-[#2B1C17]">
            {currentTitle}
          </h2>
        </div>

        <div className="hidden w-full max-w-[430px] lg:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B28A47]" size={16} />
            <input
              type="search"
              placeholder="Rechercher dans l’administration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]/70 pl-10 pr-4 text-[12px] text-[#2B1C17] outline-none transition focus:border-[#0F5A46]/40 focus:ring-2 focus:ring-[#0F5A46]/10"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden h-10 items-center gap-2 rounded-full border border-[#B28A47]/20 bg-[#FFFDF8] px-4 text-[11px] font-semibold text-[#0F5A46] transition hover:border-[#B28A47]/40 hover:bg-[#F8F5EF] sm:inline-flex"
          >
            Voir le site
            <ExternalLink size={14} strokeWidth={1.6} />
          </Link>

          <button
            type="button"
            aria-label="Aide"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#FFFDF8] text-[#6F625C] transition hover:bg-[#F8F5EF] sm:inline-flex"
          >
            <HelpCircle size={17} strokeWidth={1.6} />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#FFFDF8] text-[#0F5A46] transition hover:bg-[#F8F5EF]"
          >
            <Bell size={17} strokeWidth={1.6} />
            <span className="absolute right-[8px] top-[8px] h-1.5 w-1.5 rounded-full bg-[#D2AA5A]" />
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]/65 py-1.5 pl-2 pr-3 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F5A46] text-[9px] font-bold text-[#FFFDF8]">
              AD
            </span>
            <span className="text-[11px] font-semibold text-[#2B1C17]">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}
