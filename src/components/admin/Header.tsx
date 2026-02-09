'use client'

import { Search, Bell, HelpCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function AdminHeader() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  if (pathname?.startsWith('/admin/login')) return null

  return (
    <header className="sticky top-0 z-30 border-b border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white">
      <div className="px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
            <Sparkles size={14} />
            Control Center
          </div>
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher reservations, chambres, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-amber-200/60 bg-white px-10 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-amber-300"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-white px-3 py-1 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Sync auto
          </div>
          <button className="relative rounded-full border border-amber-200/60 bg-white p-2 text-amber-700 hover:bg-amber-50">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          </button>
          <button className="rounded-full border border-amber-200/60 bg-white p-2 text-amber-700 hover:bg-amber-50">
            <HelpCircle size={18} />
          </button>
          <div className="hidden md:block rounded-full border border-amber-200/60 bg-white px-4 py-2 text-xs font-semibold text-gray-700">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
