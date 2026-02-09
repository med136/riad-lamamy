#!/bin/bash

# ============================================================================
# SCRIPT D'INSTALLATION DU PANEL ADMIN PROFESSIONNEL POUR RIAD
# ============================================================================

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo -e "${CYAN}"
    echo "=================================================================="
    echo "   INSTALLATION PANEL ADMIN PROFESSIONNEL - RIAD DAR AL ANDALUS"
    echo "=================================================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ ${1}...${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

# Vérifier si on est dans un projet Next.js
check_nextjs_project() {
    print_step "Vérification du projet Next.js"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json non trouvé. Exécutez ce script à la racine de votre projet Next.js."
        exit 1
    fi
    
    if ! grep -q "next" "package.json"; then
        print_error "Ce n'est pas un projet Next.js."
        exit 1
    fi
    
    print_success "Projet Next.js détecté"
}

# Vérifier Supabase
check_supabase() {
    print_step "Vérification de Supabase"
    
    # Vérifier si supabase CLI est installé
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI non installé"
        echo "Installation de Supabase CLI..."
        
        # Pour macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install supabase/tap/supabase
        # Pour Linux
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            wget -qO- https://cli.supabase.com | sh
        else
            print_error "OS non supporté pour l'installation automatique"
            echo "Veuillez installer Supabase CLI manuellement :"
            echo "https://supabase.com/docs/guides/cli"
            exit 1
        fi
    fi
    
    print_success "Supabase CLI installé"
    
    # Vérifier le dossier supabase
    if [ ! -d "supabase" ]; then
        print_warning "Dossier supabase non trouvé"
        echo "Initialisation de Supabase..."
        supabase init
    fi
    
    # Vérifier les variables d'environnement
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local non trouvé"
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            print_warning "Copie de .env.local.example vers .env.local"
            print_warning "Veuillez configurer vos variables dans .env.local"
        else
            print_warning "Créez un fichier .env.local avec vos variables Supabase"
        fi
    fi
    
    print_success "Configuration Supabase vérifiée"
}

# Créer la structure de l'admin
create_admin_structure() {
    print_step "Création de la structure d'administration"
    
    # Dossiers principaux - CORRIGÉ : pas de parenthèses dans les noms
    mkdir -p "src/app/admin/dashboard"
    mkdir -p "src/app/admin/login"
    mkdir -p "src/app/admin/chambres"
    mkdir -p "src/app/admin/reservations"
    mkdir -p "src/app/admin/galerie"
    mkdir -p "src/app/admin/utilisateurs"
    mkdir -p "src/app/admin/parametres"
    
    # Composants admin
    mkdir -p "src/components/admin"
    mkdir -p "src/components/ui"
    mkdir -p "src/lib/auth"
    mkdir -p "src/lib/supabase"
    mkdir -p "src/hooks"
    mkdir -p "src/providers"
    mkdir -p "src/types"
    
    print_success "Structure créée"
}

# Créer les fichiers de migration Supabase
create_supabase_migrations() {
    print_step "Création des migrations Supabase"
    
    mkdir -p "supabase/migrations"
    
    local migration_file="supabase/migrations/$(date +%Y%m%d%H%M%S)_admin_panel.sql"
    
    cat > "$migration_file" << 'MIGRATION_EOF'
-- ============================================================================
-- MIGRATION POUR LE PANEL ADMIN RIAD DAR AL ANDALUS
-- ============================================================================

-- Création des types enum
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff');
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
  CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
  CREATE TYPE room_status AS ENUM ('available', 'maintenance', 'cleaning', 'occupied');
END IF; END $$;

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table des profils admin (extension de auth.users)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'staff',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations (améliorée)
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(20) UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  guest_count INTEGER DEFAULT 1,
  room_id UUID REFERENCES rooms(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status reservation_status DEFAULT 'pending',
  special_requests TEXT,
  admin_notes TEXT,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des chambres (améliorée)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  max_guests INTEGER DEFAULT 2,
  base_price DECIMAL(10,2) NOT NULL,
  seasonal_prices JSONB DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status room_status DEFAULT 'available',
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  available BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de la galerie
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des témoignages
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_country TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES admin_profiles(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paramètres
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_reservations_status') THEN
  CREATE INDEX idx_reservations_status ON reservations(status);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_reservations_dates') THEN
  CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_rooms_status') THEN
  CREATE INDEX idx_rooms_status ON rooms(status);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_activity_logs_user') THEN
  CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_activity_logs_date') THEN
  CREATE INDEX idx_activity_logs_date ON activity_logs(created_at DESC);
END IF; END $$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour admin_profiles
CREATE POLICY "Les admins peuvent voir tous les profils"
    ON admin_profiles FOR SELECT
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "Les super admins peuvent modifier les profils"
    ON admin_profiles FOR ALL
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role = 'super_admin'));

-- Politiques pour les réservations
CREATE POLICY "Le staff peut voir les réservations"
    ON reservations FOR SELECT
    USING (auth.uid() IN (SELECT id FROM admin_profiles));

CREATE POLICY "Le staff peut modifier les réservations"
    ON reservations FOR ALL
    USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- Insertion des données initiales
INSERT INTO settings (key, value, description) VALUES
('site_title', '"Riad Dar Al Andalus"', 'Titre du site'),
('contact_email', '"contact@riaddaralandalus.com"', 'Email de contact'),
('contact_phone', '"+212 5 XX XX XX XX"', 'Téléphone de contact'),
('address', '{"street": "Rue de la Médina", "city": "Marrakech", "postal_code": "40000", "country": "Maroc"}'::jsonb, 'Adresse du riad'),
('social_media', '{"facebook": "https://facebook.com/riaddaralandalus", "instagram": "https://instagram.com/riaddaralandalus"}'::jsonb, 'Liens réseaux sociaux'),
('booking_settings', '{"min_stay": 1, "max_stay": 30, "check_in_time": "14:00", "check_out_time": "12:00"}'::jsonb, 'Paramètres de réservation')
ON CONFLICT (key) DO NOTHING;

-- Insertion d'un admin par défaut (à remplacer par vos identifiants)
-- Note: L'utilisateur doit d'abord être créé via l'interface d'auth
INSERT INTO admin_profiles (id, role, full_name) VALUES
('00000000-0000-0000-0000-000000000000', 'super_admin', 'Administrateur Principal')
ON CONFLICT (id) DO NOTHING;

-- Données exemples pour les chambres
INSERT INTO rooms (name, slug, description, max_guests, base_price, amenities, featured) VALUES
('Suite Royale', 'suite-royale', 'Notre suite la plus luxueuse avec vue sur les montagnes de l''Atlas', 4, 450.00, '{"jacuzzi", "terrasse privée", "cheminée", "mini-bar", "TV écran plat"}', true),
('Chambre Deluxe', 'chambre-deluxe', 'Chambre spacieuse avec décoration traditionnelle marocaine', 2, 280.00, '{"balcon", "salle de bain marbre", "climatisation", "wifi"}', true),
('Suite Familiale', 'suite-familiale', 'Parfaite pour les familles, deux chambres communicantes', 6, 520.00, '{"2 chambres", "salon", "cuisinette", "terrasse"}', false)
ON CONFLICT (slug) DO NOTHING;

-- Données exemples pour les services
INSERT INTO services (title, description, icon, price, available) VALUES
('Massage Traditionnel', 'Massage aux huiles essentielles et techniques berbères', 'spa', 350.00, true),
('Dîner aux Chandelles', 'Dîner romantique sur la terrasse avec vue sur les étoiles', 'dinner', 500.00, true),
('Excursion dans l''Atlas', 'Journée guidée dans les montagnes de l''Atlas avec déjeuner', 'hiking', 800.00, true),
('Cours de Cuisine', 'Apprenez à préparer un tajine traditionnel avec notre chef', 'cooking', 450.00, true)
ON CONFLICT DO NOTHING;

MIGRATION_EOF
    
    print_success "Migration créée: $(basename $migration_file)"
}

# Créer le fichier de seed pour les données de test
create_seed_data() {
    print_step "Création des données de test"
    
    cat > "supabase/seed.sql" << 'SEED_EOF'
-- ============================================================================
-- DONNÉES DE TEST POUR LE PANEL ADMIN
-- ============================================================================

-- Nettoyage des tables (optionnel, commenté par sécurité)
-- TRUNCATE TABLE reservations, rooms, services, gallery, testimonials CASCADE;

-- Réservations de test
INSERT INTO reservations (reference, guest_name, guest_email, guest_phone, guest_count, check_in, check_out, total_amount, status) VALUES
('RES2024001', 'Sophie Martin', 'sophie.martin@email.com', '+33 6 12 34 56 78', 2, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 2250.00, 'confirmed'),
('RES2024002', 'Ahmed Alami', 'ahmed.alami@email.com', '+212 6 11 22 33 44', 4, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '12 days', 3600.00, 'pending'),
('RES2024003', 'John Smith', 'john.smith@email.com', '+1 555 123 4567', 2, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 1400.00, 'completed')
ON CONFLICT (reference) DO NOTHING;

-- Témoignages de test
INSERT INTO testimonials (guest_name, guest_country, rating, content, approved, featured) VALUES
('Marie Dubois', 'France', 5, 'Un séjour magnifique dans un cadre exceptionnel. Le personnel est aux petits soins !', true, true),
('Carlos Rodriguez', 'Espagne', 4, 'Très beau riad, la décoration est superbe. Petit déjeuner délicieux.', true, true),
('Emma Wilson', 'Angleterre', 5, 'Absolutely stunning! The royal suite was beyond our expectations. We''ll be back!', true, true)
ON CONFLICT DO NOTHING;

-- Images pour la galerie
INSERT INTO gallery (title, description, image_url, category, featured) VALUES
('Cour intérieure', 'La magnifique cour centrale avec sa fontaine', '/images/gallery/cour-interieure.jpg', 'architecture', true),
('Suite Royale', 'Vue sur la chambre principale de la Suite Royale', '/images/gallery/suite-royale.jpg', 'chambres', true),
('Terrasse panoramique', 'Vue depuis la terrasse sur les toits de Marrakech', '/images/gallery/terrasse.jpg', 'vues', true),
('Spa traditionnel', 'Notre espace bien-être avec hammam', '/images/gallery/spa.jpg', 'services', false)
ON CONFLICT DO NOTHING;

SEED_EOF
    
    print_success "Données de test créées"
}

# Installer les dépendances nécessaires
install_dependencies() {
    print_step "Installation des dépendances"
    
    # Vérifier si npm est disponible
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    # Dépendances principales
    echo "Installation des dépendances Supabase..."
    npm install @supabase/ssr @supabase/supabase-js
    
    echo "Installation des dépendances UI..."
    npm install lucide-react date-fns react-hook-form zod @hookform/resolvers
    
    echo "Installation des dépendances graphiques..."
    npm install recharts @tanstack/react-table
    
    echo "Installation des notifications..."
    npm install react-hot-toast
    
    # Dépendances de développement
    echo "Installation des dépendances de développement..."
    npm install -D @types/react @types/node
    
    print_success "Dépendances installées"
}

# Créer le layout admin
create_admin_layout() {
    print_step "Création du layout admin"
    
    # Layout principal
    cat > "src/app/admin/layout.tsx" << 'LAYOUT_EOF'
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
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
LAYOUT_EOF

    # Styles CSS pour l'admin
    cat > "src/app/admin/admin.css" << 'CSS_EOF'
/* Styles spécifiques à l'admin */

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Loader */
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Card hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
CSS_EOF

    print_success "Layout admin créé"
}

# Créer les composants admin
create_admin_components() {
    print_step "Création des composants admin"
    
    # Sidebar
    cat > "src/components/admin/Sidebar.tsx" << 'SIDEBAR_EOF'
'use client'

import { useState } from 'react'
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
  Bell
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
  { href: '/admin/parametres', icon: Settings, label: 'Paramètres' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
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
        w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-xl font-bold">RA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Riad Admin</h1>
              <p className="text-sm text-gray-400">Dar Al Andalus</p>
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
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.label === 'Réservations' && (
                  <span className="ml-auto bg-red-500 text-xs px-2 py-1 rounded-full">
                    3
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-bold">AD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Administrateur</p>
              <p className="text-sm text-gray-400">Super Admin</p>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Bell size={18} />
            </button>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                     bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
SIDEBAR_EOF

    # Header
    cat > "src/components/admin/Header.tsx" << 'HEADER_EOF'
'use client'

import { Search, Bell, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher des réservations, chambres, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <HelpCircle size={20} />
          </button>

          {/* Date */}
          <div className="hidden md:block px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
HEADER_EOF

    # Dashboard page
    cat > "src/app/admin/dashboard/page.tsx" << 'DASHBOARD_EOF'
'use client'

import { useEffect, useState } from 'react'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Bed,
  Clock,
  Star
} from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import RecentReservations from '@/components/admin/RecentReservations'
import OccupancyChart from '@/components/admin/OccupancyChart'
import QuickActions from '@/components/admin/QuickActions'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    activeReservations: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingReviews: 0,
    availableRooms: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()
    
    try {
      // Récupérer les statistiques
      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })

      const { count: activeReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')

      const { count: availableRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')

      const { count: pendingReviews } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('approved', false)

      // Calculer le revenu (exemple)
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('status', 'completed')

      const totalRevenue = reservationsData?.reduce(
        (sum, item) => sum + (item.total_amount || 0), 0
      ) || 0

      setStats({
        totalReservations: totalReservations || 0,
        activeReservations: activeReservations || 0,
        totalRevenue,
        occupancyRate: 78, // Exemple
        pendingReviews: pendingReviews || 0,
        availableRooms: availableRooms || 0
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Réservations Total',
      value: stats.totalReservations,
      change: '+12%',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Réservations Actives',
      value: stats.activeReservations,
      change: '+3',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Revenu Total',
      value: `${stats.totalRevenue.toLocaleString('fr-FR')} €`,
      change: '+8.2%',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: "Taux d'Occupation",
      value: `${stats.occupancyRate}%`,
      change: '+5%',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      title: 'Chambres Libres',
      value: stats.availableRooms,
      change: '2/8',
      icon: Bed,
      color: 'indigo'
    },
    {
      title: 'Avis en Attente',
      value: stats.pendingReviews,
      change: 'À modérer',
      icon: Star,
      color: 'red'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bonjour, Administrateur 👋</h1>
            <p className="opacity-90">
              Voici un aperçu de votre activité aujourd'hui.
              Vous avez {stats.activeReservations} réservations actives.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock size={18} className="mr-2" />
              <span>{new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow border hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <p className="text-sm text-green-600 mt-1">{card.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <card.icon className={`text-${card.color}-600`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border p-6">
            <h3 className="text-lg font-semibold mb-4">Occupation Mensuelle</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Graphique d'occupation à venir...
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl shadow border p-6">
            <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span className="font-medium">➕ Nouvelle réservation</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <span className="font-medium">📊 Générer rapport</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <span className="font-medium">📧 Envoyer newsletter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Réservations Récentes</h3>
          <p className="text-gray-600 text-sm">Les 10 dernières réservations</p>
        </div>
        <div className="p-6">
          <div className="text-gray-500 text-center py-8">
            Liste des réservations à venir...
          </div>
        </div>
      </div>
    </div>
  )
}
DASHBOARD_EOF

    # Login page
    cat > "src/app/admin/login/page.tsx" << 'LOGIN_EOF'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Hotel } from 'lucide-react'
import { signIn } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error(error.message || 'Identifiants incorrects')
        return
      }

      toast.success('Connexion réussie !')
      router.push('/admin/dashboard')
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <Hotel size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Riad Admin</h1>
          <p className="text-gray-600 mt-2">Accès réservé au personnel</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@riaddaralandalus.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="loader-small mr-2"></div>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Pour toute demande d'accès, contactez le super administrateur.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Riad Dar Al Andalus. Tous droits réservés.
          </p>
        </div>
      </div>

      <style jsx>{`
        .loader-small {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
LOGIN_EOF

    print_success "Composants admin créés"
}

# Créer les utilitaires Supabase
create_supabase_utils() {
    print_step "Création des utilitaires Supabase"
    
    mkdir -p "src/lib/supabase"
    mkdir -p "src/lib/supabase/services"
    
    # Client Supabase
    cat > "src/lib/supabase/client.ts" << 'CLIENT_EOF'
import { createBrowserClient } from '@supabase/ssr'

// Types temporaires - seront générés par Supabase
type Database = any

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (!error) {
    window.location.href = '/admin/login'
  }
  return { error }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const uploadFile = async (file: File, bucket: string, path: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  return urlData.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
}
CLIENT_EOF

    # Server client
    cat > "src/lib/supabase/server.ts" << 'SERVER_EOF'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Types temporaires
type Database = any

export const createClient = async () => {
  const cookieStore = await cookies()
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore en mode middleware
          }
        },
      },
    }
  )
}

export const getCurrentUser = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
SERVER_EOF

    # Service pour les réservations
    cat > "src/lib/supabase/services/reservations.ts" << 'RESERVATIONS_EOF'
import { createClient } from '../client'

export class ReservationService {
  static async getAll(filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const supabase = createClient()
    let query = supabase.from('reservations').select('*')
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.startDate) {
      query = query.gte('check_in', filters.startDate.toISOString())
    }
    
    if (filters?.endDate) {
      query = query.lte('check_out', filters.endDate.toISOString())
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async create(reservation: any) {
    const supabase = createClient()
    
    // Générer une référence unique
    const reference = `RES${Date.now()}${Math.floor(Math.random() * 1000)}`
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...reservation,
        reference
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async update(id: string, updates: any) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async getStats() {
    const supabase = createClient()
    
    const { count: total } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
    
    const { count: pending } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: confirmed } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
    
    const { data: revenueData } = await supabase
      .from('reservations')
      .select('total_amount')
      .eq('status', 'completed')
    
    const totalRevenue = revenueData?.reduce(
      (sum, item) => sum + (item.total_amount || 0), 0
    ) || 0
    
    return {
      total,
      pending,
      confirmed,
      totalRevenue
    }
  }
}
RESERVATIONS_EOF

    # Types TypeScript
    cat > "src/types/supabase.ts" << 'TYPES_EOF'
export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string
          role: 'super_admin' | 'admin' | 'manager' | 'staff'
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'super_admin' | 'admin' | 'manager' | 'staff'
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'super_admin' | 'admin' | 'manager' | 'staff'
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          reference: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          guest_count: number
          room_id: string | null
          check_in: string
          check_out: string
          total_amount: number
          paid_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests: string | null
          admin_notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reference: string
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          guest_count?: number
          room_id?: string | null
          check_in: string
          check_out: string
          total_amount: number
          paid_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          admin_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reference?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          guest_count?: number
          room_id?: string | null
          check_in?: string
          check_out?: string
          total_amount?: number
          paid_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          admin_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          max_guests: number
          base_price: number
          seasonal_prices: any
          amenities: string[]
          images: string[]
          status: 'available' | 'maintenance' | 'cleaning' | 'occupied'
          featured: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          max_guests?: number
          base_price: number
          seasonal_prices?: any
          amenities?: string[]
          images?: string[]
          status?: 'available' | 'maintenance' | 'cleaning' | 'occupied'
          featured?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          max_guests?: number
          base_price?: number
          seasonal_prices?: any
          amenities?: string[]
          images?: string[]
          status?: 'available' | 'maintenance' | 'cleaning' | 'occupied'
          featured?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
TYPES_EOF

    print_success "Utilitaires Supabase créés"
}

# Créer le middleware
create_middleware() {
    print_step "Création du middleware de protection"
    
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
  ]
}
MIDDLEWARE_EOF

    print_success "Middleware créé"
}

# Mettre à jour le fichier package.json
update_package_json() {
    print_step "Mise à jour du package.json"
    
    if [ -f "package.json" ]; then
        # Ajouter des scripts utiles
        if ! grep -q '"supabase"' "package.json"; then
            # Sauvegarder le fichier
            cp "package.json" "package.json.backup"
            
            # Utiliser jq si disponible, sinon sed
            if command -v jq &> /dev/null; then
                jq '.scripts += {
                    "supabase:start": "supabase start",
                    "supabase:stop": "supabase stop",
                    "supabase:reset": "supabase db reset",
                    "supabase:push": "supabase db push",
                    "supabase:studio": "supabase studio",
                    "dev:supabase": "npm run supabase:start & npm run dev"
                }' "package.json" > "package.json.tmp" && mv "package.json.tmp" "package.json"
            else
                # Fallback pour sed
                sed -i.bak '/"scripts": {/a\
    "supabase:start": "supabase start",\
    "supabase:stop": "supabase stop",\
    "supabase:reset": "supabase db reset",\
    "supabase:push": "supabase db push",\
    "supabase:studio": "supabase studio",\
    "dev:supabase": "npm run supabase:start & npm run dev",' "package.json"
                rm -f "package.json.bak"
            fi
            print_success "Scripts Supabase ajoutés à package.json"
        fi
    fi
}

# Main execution flow
main() {
    print_header
    check_nextjs_project
    # Si supabase n'est pas complètement configuré, on affiche un warning mais on continue
    if ! check_supabase; then
        print_warning "Supabase non configuré (ou CLI absente). Le script continue mais vérifiez la configuration plus tard."
    fi

    create_admin_structure
    create_supabase_migrations
    create_seed_data
    create_admin_layout
    create_admin_components
    create_supabase_utils
    create_middleware

    # Installation des dépendances est facultative
    if [ "$1" != "--no-install" ]; then
        install_dependencies
    else
        print_warning "Installation des dépendances sautée (--no-install)"
    fi

    update_package_json

    print_success "Installation du panel admin terminée. Vérifiez les fichiers créés sous src/ et supabase/"
}

# Exécuter le script automatiquement si lancé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
