import type { Metadata } from 'next'
import './admin.css'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Admin - Riad Dar Al Andalus',
  description: 'Panneau d\'administration du Riad Dar Al Andalus',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </div>
  )
}
