#!/bin/bash

# ============================================================================
# SCRIPT DE CORRECTION DU PANEL ADMIN - VERSION CORRIGÉE
# ============================================================================

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CORRECTION DU PANEL ADMIN RIAD${NC}"
echo -e "${BLUE}========================================${NC}"

# 0. Créer d'abord tous les dossiers manquants
echo -e "\n${YELLOW}0. Création des dossiers manquants...${NC}"

# Liste des dossiers à créer
directories=(
  "src/app/admin/login"
  "src/app/admin/dashboard"
  "src/app/admin/chambres"
  "src/app/admin/reservations"
  "src/app/admin/galerie"
  "src/app/admin/services"
  "src/app/admin/utilisateurs"
  "src/app/admin/parametres"
  "src/app/admin/temoignages"
  "src/components/admin"
)

for dir in "${directories[@]}"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo -e "${GREEN}✓ Dossier créé: $dir${NC}"
  else
    echo -e "${BLUE}✓ Dossier existe déjà: $dir${NC}"
  fi
done

# 1. Corriger le layout de login
echo -e "\n${YELLOW}1. Correction de la page login...${NC}"
cat > "src/app/admin/login/layout.tsx" << 'LOGIN_LAYOUT_EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../admin.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Login Admin - Riad Dar Al Andalus',
  description: 'Connexion au panel administration',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}
LOGIN_LAYOUT_EOF
echo -e "${GREEN}✓ Layout login créé${NC}"

# 2. Corriger le layout admin principal
echo -e "\n${YELLOW}2. Correction du layout admin principal...${NC}"
cat > "src/app/admin/layout.tsx" << 'ADMIN_LAYOUT_EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './admin.css'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
    </div>
  )
}
ADMIN_LAYOUT_EOF
echo -e "${GREEN}✓ Layout admin corrigé${NC}"

# 3. Créer les pages manquantes
echo -e "\n${YELLOW}3. Création des pages manquantes...${NC}"

# Page Chambres
cat > "src/app/admin/chambres/page.tsx" << 'CHAMBRES_EOF'
'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'

const rooms = [
  { id: 1, name: 'Suite Royale', price: 450, status: 'Disponible', guests: 4 },
  { id: 2, name: 'Chambre Deluxe', price: 280, status: 'Occupée', guests: 2 },
  { id: 3, name: 'Suite Familiale', price: 520, status: 'Maintenance', guests: 6 },
]

export default function ChambresPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Chambres</h1>
          <p className="text-gray-600">Gérez les chambres, tarifs et disponibilités</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Ajouter une chambre
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une chambre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
          <Filter size={20} className="mr-2" />
          Filtrer
        </button>
      </div>

      {/* Rooms table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix (€/nuit)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{room.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{room.price} €</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      room.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                      room.status === 'Occupée' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{room.guests} personnes</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chambres totales</p>
              <p className="text-2xl font-bold mt-2">8</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-blue-600">🏨</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chambres disponibles</p>
              <p className="text-2xl font-bold mt-2">5</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <div className="text-green-600">✅</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taux d'occupation</p>
              <p className="text-2xl font-bold mt-2">62%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <div className="text-purple-600">📊</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
CHAMBRES_EOF
echo -e "${GREEN}✓ Page Chambres créée${NC}"

# Page Réservations
cat > "src/app/admin/reservations/page.tsx" << 'RESERVATIONS_EOF'
'use client'

import { useState } from 'react'
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react'

const reservations = [
  { id: 'RES001', guest: 'Sophie Martin', room: 'Suite Royale', checkIn: '2024-01-15', checkOut: '2024-01-20', status: 'Confirmée' },
  { id: 'RES002', guest: 'Ahmed Alami', room: 'Chambre Deluxe', checkIn: '2024-01-18', checkOut: '2024-01-25', status: 'En attente' },
  { id: 'RES003', guest: 'John Smith', room: 'Suite Familiale', checkIn: '2024-01-10', checkOut: '2024-01-12', status: 'Annulée' },
]

export default function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmée': return 'bg-green-100 text-green-800'
      case 'En attente': return 'bg-yellow-100 text-yellow-800'
      case 'Annulée': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmée': return <CheckCircle size={16} />
      case 'En attente': return <Clock size={16} />
      case 'Annulée': return <XCircle size={16} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-600">Consultez et gérez toutes les réservations</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Calendar size={20} className="mr-2" />
          Nouvelle réservation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold mt-2">24</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-blue-600">📅</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmées</p>
              <p className="text-2xl font-bold mt-2">18</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold mt-2">4</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Annulées</p>
              <p className="text-2xl font-bold mt-2">2</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une réservation..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-4 py-2 rounded-lg ${statusFilter === 'confirmed' ? 'bg-green-600 text-white' : 'border border-gray-300'}`}
          >
            Confirmées
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg ${statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'border border-gray-300'}`}
          >
            En attente
          </button>
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
          <Filter size={20} className="mr-2" />
          Plus de filtres
        </button>
      </div>

      {/* Reservations table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-medium text-gray-900">{res.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{res.guest}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{res.room}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>Arrivée: {res.checkIn}</div>
                      <div>Départ: {res.checkOut}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(res.status)}`}>
                      {getStatusIcon(res.status)}
                      <span className="ml-2">{res.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        Voir
                      </button>
                      <button className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100">
                        Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
RESERVATIONS_EOF
echo -e "${GREEN}✓ Page Réservations créée${NC}"

# Page Galerie
cat > "src/app/admin/galerie/page.tsx" << 'GALERIE_EOF'
'use client'

import { useState } from 'react'
import { Upload, Search, Grid, List, Image as ImageIcon, Trash2, Star } from 'lucide-react'

const galleryItems = [
  { id: 1, title: 'Cour intérieure', category: 'Architecture', featured: true, url: '/images/gallery/cour.jpg' },
  { id: 2, title: 'Suite Royale', category: 'Chambres', featured: true, url: '/images/gallery/suite.jpg' },
  { id: 3, title: 'Terrasse', category: 'Vues', featured: false, url: '/images/gallery/terrasse.jpg' },
  { id: 4, title: 'Spa', category: 'Services', featured: false, url: '/images/gallery/spa.jpg' },
]

export default function GaleriePage() {
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galerie Photos</h1>
          <p className="text-gray-600">Gérez les images de votre riad</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload size={20} className="mr-2" />
          Ajouter des photos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total photos</p>
              <p className="text-2xl font-bold mt-2">48</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <ImageIcon className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mises en avant</p>
              <p className="text-2xl font-bold mt-2">12</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chambres</p>
              <p className="text-2xl font-bold mt-2">15</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <div className="text-purple-600">🛏️</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Espace disque</p>
              <p className="text-2xl font-bold mt-2">124 MB</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <div className="text-green-600">💾</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une photo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setSelectedCategory('chambres')}
            className={`px-4 py-2 rounded-lg ${selectedCategory === 'chambres' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Chambres
          </button>
          <button
            onClick={() => setSelectedCategory('services')}
            className={`px-4 py-2 rounded-lg ${selectedCategory === 'services' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Services
          </button>
        </div>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Gallery grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow border overflow-hidden hover-lift">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <ImageIcon size={48} className="text-gray-400" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  {item.featured && (
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <div className="flex justify-between mt-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Éditer
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-800">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mise en avant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {galleryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.featured ? (
                      <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        Éditer
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
GALERIE_EOF
echo -e "${GREEN}✓ Page Galerie créée${NC}"

# Page Services
cat > "src/app/admin/services/page.tsx" << 'SERVICES_EOF'
'use client'

import { useState } from 'react'
import { Plus, Search, DollarSign, Clock, CheckCircle } from 'lucide-react'

const services = [
  { id: 1, name: 'Massage Traditionnel', price: 350, duration: 60, available: true },
  { id: 2, name: 'Dîner aux Chandelles', price: 500, duration: 120, available: true },
  { id: 3, name: 'Excursion Atlas', price: 800, duration: 480, available: false },
]

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services Complémentaires</h1>
          <p className="text-gray-600">Gérez les services proposés aux clients</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Ajouter un service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Services actifs</p>
              <p className="text-2xl font-bold mt-2">6</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenu moyen/service</p>
              <p className="text-2xl font-bold mt-2">450 €</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Durée moyenne</p>
              <p className="text-2xl font-bold mt-2">2h 30min</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un service..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Services list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow border p-6 hover-lift">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {service.available ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <DollarSign size={18} className="mr-2" />
                <span className="font-medium">{service.price} €</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-2" />
                <span>{service.duration} minutes</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                Modifier
              </button>
              <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
SERVICES_EOF
echo -e "${GREEN}✓ Page Services créée${NC}"

# Page Utilisateurs
cat > "src/app/admin/utilisateurs/page.tsx" << 'UTILISATEURS_EOF'
'use client'

import { useState } from 'react'
import { UserPlus, Search, Shield, User, Users, Lock } from 'lucide-react'

const users = [
  { id: 1, name: 'Admin Principal', email: 'admin@riaddaralandalus.com', role: 'Super Admin', lastLogin: 'Aujourd\'hui' },
  { id: 2, name: 'Manager Réception', email: 'reception@riaddaralandalus.com', role: 'Manager', lastLogin: 'Hier' },
  { id: 3, name: 'Staff Housekeeping', email: 'housekeeping@riaddaralandalus.com', role: 'Staff', lastLogin: '2 jours' },
]

export default function UtilisateursPage() {
  const [selectedRole, setSelectedRole] = useState('all')

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800'
      case 'Manager': return 'bg-blue-100 text-blue-800'
      case 'Staff': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Shield size={16} />
      case 'Manager': return <User size={16} />
      case 'Staff': return <Users size={16} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérez les accès au panel admin</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <UserPlus size={20} className="mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total utilisateurs</p>
              <p className="text-2xl font-bold mt-2">8</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-2xl font-bold mt-2">2</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <Shield className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Managers</p>
              <p className="text-2xl font-bold mt-2">3</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <User className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Staff</p>
              <p className="text-2xl font-bold mt-2">3</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <div className="text-purple-600">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-4 py-2 rounded-lg ${selectedRole === 'all' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedRole('super-admin')}
            className={`px-4 py-2 rounded-lg ${selectedRole === 'super-admin' ? 'bg-red-600 text-white' : 'border border-gray-300'}`}
          >
            Super Admins
          </button>
          <button
            onClick={() => setSelectedRole('manager')}
            className={`px-4 py-2 rounded-lg ${selectedRole === 'manager' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Managers
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière connexion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-2">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{user.lastLogin}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        Éditer
                      </button>
                      <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                        <Lock size={14} className="inline mr-1" />
                        Réinitialiser MDP
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
UTILISATEURS_EOF
echo -e "${GREEN}✓ Page Utilisateurs créée${NC}"

# Page Paramètres
cat > "src/app/admin/parametres/page.tsx" << 'PARAMETRES_EOF'
'use client'

import { useState } from 'react'
import { Save, Globe, Bell, CreditCard, Shield, Mail } from 'lucide-react'

export default function ParametresPage() {
  const [settings, setSettings] = useState({
    siteName: 'Riad Dar Al Andalus',
    contactEmail: 'contact@riaddaralandalus.com',
    contactPhone: '+212 5 XX XX XX XX',
    notificationEnabled: true,
    maintenanceMode: false,
  })

  const handleSave = () => {
    alert('Paramètres sauvegardés avec succès !')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du Site</h1>
          <p className="text-gray-600">Configurez les paramètres de votre riad</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save size={20} className="mr-2" />
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Settings forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center mb-6">
              <Globe size={24} className="text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Paramètres Généraux</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center mb-6">
              <Bell size={24} className="text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-600">Recevoir des notifications pour nouvelles réservations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationEnabled}
                    onChange={(e) => setSettings({...settings, notificationEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* System */}
          <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center mb-6">
              <Shield size={24} className="text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Système</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mode maintenance</p>
                  <p className="text-sm text-gray-600">Le site sera inaccessible aux visiteurs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Info cards */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center mb-4">
              <CreditCard size={20} className="text-purple-600 mr-2" />
              <h3 className="font-bold text-gray-900">Paiements</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configurez vos méthodes de paiement acceptées
            </p>
            <button className="w-full py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50">
              Configurer
            </button>
          </div>

          {/* Email Templates */}
          <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center mb-4">
              <Mail size={20} className="text-blue-600 mr-2" />
              <h3 className="font-bold text-gray-900">Emails Automatiques</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Personnalisez les emails envoyés aux clients
            </p>
            <button className="w-full py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50">
              Personnaliser
            </button>
          </div>

          {/* Backup */}
          <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center mb-4">
              <Shield size={20} className="text-green-600 mr-2" />
              <h3 className="font-bold text-gray-900">Sauvegarde</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Dernière sauvegarde: <span className="font-medium">Aujourd'hui, 02:30</span>
            </p>
            <button className="w-full py-2 text-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
              Sauvegarder maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
PARAMETRES_EOF
echo -e "${GREEN}✓ Page Paramètres créée${NC}"

# Page Témoignages
cat > "src/app/admin/temoignages/page.tsx" << 'TEMOIGNAGES_EOF'
'use client'

import { useState } from 'react'
import { Star, Check, X, Search, Filter } from 'lucide-react'

const testimonials = [
  { id: 1, name: 'Marie Dubois', country: 'France', rating: 5, content: 'Un séjour magnifique !', approved: true, featured: true },
  { id: 2, name: 'Carlos Rodriguez', country: 'Espagne', rating: 4, content: 'Très beau riad.', approved: true, featured: false },
  { id: 3, name: 'John Smith', country: 'Angleterre', rating: 5, content: 'Absolutely stunning!', approved: false, featured: false },
]

export default function TemoignagesPage() {
  const [filter, setFilter] = useState('all')

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Témoignages Clients</h1>
          <p className="text-gray-600">Modérez les avis des clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total témoignages</p>
              <p className="text-2xl font-bold mt-2">42</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-blue-600">💬</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold mt-2">3</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <div className="text-yellow-600">⏳</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Note moyenne</p>
              <p className="text-2xl font-bold mt-2">4.8/5</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Star className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un témoignage..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'border border-gray-300'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-lg ${filter === 'featured' ? 'bg-green-600 text-white' : 'border border-gray-300'}`}
          >
            Mis en avant
          </button>
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
          <Filter size={20} className="mr-2" />
          Trier
        </button>
      </div>

      {/* Testimonials list */}
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl shadow border p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="font-medium text-gray-900 mr-3">{testimonial.name}</h3>
                  <span className="text-sm text-gray-500">{testimonial.country}</span>
                </div>
                <div className="flex mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </div>
              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                {!testimonial.approved && (
                  <>
                    <button className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                      <Check size={16} className="mr-2" />
                      Approuver
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <X size={16} className="mr-2" />
                      Rejeter
                    </button>
                  </>
                )}
                <button className={`px-4 py-2 rounded-lg ${
                  testimonial.featured 
                    ? 'bg-yellow-50 text-yellow-600' 
                    : 'border border-gray-300'
                }`}>
                  {testimonial.featured ? '★ Mis en avant' : 'Mettre en avant'}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {testimonial.approved ? 'Approuvé' : 'En attente'}
              </span>
              <button className="text-sm text-red-600 hover:text-red-800">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
TEMOIGNAGES_EOF
echo -e "${GREEN}✓ Page Témoignages créée${NC}"

# 4. Créer les fichiers manquants dans components/admin
echo -e "\n${YELLOW}4. Création des composants manquants...${NC}"

# Créer le composant StatCard
cat > "src/components/admin/StatCard.tsx" << 'STATCARD_EOF'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: LucideIcon
  color: string
}

export default function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-sm text-green-600 mt-1">{change}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  )
}
STATCARD_EOF
echo -e "${GREEN}✓ Component StatCard créé${NC}"

# 5. Mettre à jour le middleware
echo -e "\n${YELLOW}5. Mise à jour du middleware...${NC}"
cat > "src/middleware.ts" << 'MIDDLEWARE_EOF'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Récupérer l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()

  // Routes protégées
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') &&
                      !request.nextUrl.pathname.startsWith('/admin/login')

  // Si pas connecté et essaye d'accéder à une route admin
  if (!user && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Si connecté et sur la page login
  if (user && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ]
}
MIDDLEWARE_EOF
echo -e "${GREEN}✓ Middleware mis à jour${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ CORRECTIONS TERMINÉES AVEC SUCCÈS !${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}📋 Prochaines étapes :${NC}"
echo "1. ${GREEN}Redémarrez Next.js :${NC} npm run dev"
echo "2. ${GREEN}Accédez au panel :${NC} http://localhost:3000/admin/login"
echo "3. ${GREEN}Testez toutes les pages :${NC}"
echo "   - /admin/dashboard"
echo "   - /admin/chambres"
echo "   - /admin/reservations"
echo "   - /admin/galerie"
echo "   - /admin/services"
echo "   - /admin/utilisateurs"
echo "   - /admin/parametres"
echo "   - /admin/temoignages"