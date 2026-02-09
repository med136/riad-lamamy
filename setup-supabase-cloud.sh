#!/bin/bash

# ============================================================================
# CONFIGURATION SUPABASE EXISTANTE POUR RIAD
# ============================================================================

echo "🏨 Configuration de Supabase existant pour Riad Dar Al Andalus"
echo ""

# Configuration de votre instance existante
export SUPABASE_URL="https://ifblnesivphiixgdvxsr.supabase.co"
export SUPABASE_ANON_KEY="sb_publishable_9G3Rt4mmsxFsV1LvIDilYQ_w7OmEP3K"
export SUPABASE_SERVICE_KEY="your_service_role_key_here"  # Remplacer par votre service key

# Vérifier les variables d'environnement
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Variables Supabase non définies"
    exit 1
fi

echo "🔗 Connexion à l'instance Supabase existante..."
echo "URL: $SUPABASE_URL"
echo ""

# Exécuter le schéma SQL
echo "📝 Création des tables..."

# Créer le schéma via l'API REST
SQL=$(cat << 'SQL'
-- ============================================================================
-- SCHÉMA RIAD DAR AL ANDALUS - SUPABASE EXISTANT
-- ============================================================================

-- Table des chambres
CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(20) CHECK (category IN ('standard', 'deluxe', 'suite', 'family')),
  price DECIMAL(10,2) NOT NULL,
  size_m2 INTEGER,
  capacity INTEGER DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE DEFAULT 'RIA' || to_char(CURRENT_DATE, 'YYMM') || '-' || LPAD(nextval('booking_seq'::regclass)::text, 4, '0'),
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_country VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  room_type VARCHAR(20) NOT NULL,
  adults INTEGER DEFAULT 2,
  children INTEGER DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  language VARCHAR(10) DEFAULT 'fr',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Séquence pour les codes de réservation
CREATE SEQUENCE IF NOT EXISTS booking_seq START 1;

-- Table des messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  author_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  author_country VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des disponibilités
CREATE TABLE IF NOT EXISTS availability (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES rooms(id),
  date DATE NOT NULL,
  price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(room_id, date)
);

-- Insertion des données de démonstration

-- Chambres (éviter les doublons)
INSERT INTO rooms (name, description, category, price, size_m2, capacity, amenities, images) 
SELECT 'Chambre Standard', 'Chambre confortable avec lit double et salle de bain privée. Vue sur le patio.', 'standard', 120.00, 25, 2,
 ARRAY['Wi-Fi gratuit', 'Air conditionné', 'TV', 'Salle de bain privée', 'Coffre-fort'],
 ARRAY['/images/rooms/standard-1.jpg', '/images/rooms/standard-2.jpg']
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Chambre Standard');

INSERT INTO rooms (name, description, category, price, size_m2, capacity, amenities, images) 
SELECT 'Chambre Deluxe', 'Chambre spacieuse avec terrasse privée et vue sur le jardin. Élégance marocaine.', 'deluxe', 180.00, 35, 2,
 ARRAY['Wi-Fi haut débit', 'Air conditionné', 'TV écran plat', 'Terrasse privée', 'Mini-bar', 'Machine à café'],
 ARRAY['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg']
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Chambre Deluxe');

INSERT INTO rooms (name, description, category, price, size_m2, capacity, amenities, images) 
SELECT 'Suite Royale', 'Suite luxueuse avec salon séparé et décoration traditionnelle raffinée.', 'suite', 280.00, 55, 3,
 ARRAY['Wi-Fi fibre', 'TV 55"', 'Jacuzzi', 'Service en chambre', 'Plateau de bienvenue', 'Parking privé'],
 ARRAY['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg', '/images/rooms/suite-3.jpg']
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Suite Royale');

INSERT INTO rooms (name, description, category, price, size_m2, capacity, amenities, images) 
SELECT 'Suite Familiale', 'Idéale pour les familles, avec deux chambres communicantes et espace de vie.', 'family', 350.00, 65, 5,
 ARRAY['Wi-Fi fibre', '2 TV', 'Kitchenette', '2 salles de bain', 'Terrasse', 'Lit bébé sur demande'],
 ARRAY['/images/rooms/family-1.jpg', '/images/rooms/family-2.jpg']
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Suite Familiale');

-- Services (éviter les doublons)
INSERT INTO services (name, description, price, category, duration_minutes, display_order) 
SELECT 'Petit-déjeuner Marocain', 'Buffet complet avec spécialités locales et produits frais', 18.00, 'restauration', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Petit-déjeuner Marocain');

INSERT INTO services (name, description, price, category, duration_minutes, display_order) 
SELECT 'Dîner aux Chandelles', 'Menu gastronomique marocain dans une ambiance romantique', 45.00, 'restauration', 120, 2
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Dîner aux Chandelles');

INSERT INTO services (name, description, price, category, duration_minutes, display_order) 
SELECT 'Transfert Aéroport', 'Service privé avec chauffeur depuis l''aéroport de Marrakech', 25.00, 'transport', NULL, 3
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Transfert Aéroport');

INSERT INTO services (name, description, price, category, duration_minutes, display_order) 
SELECT 'Massage Relaxant', 'Session de massage de 60 minutes aux huiles essentielles', 75.00, 'spa', 60, 4
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Massage Relaxant');

INSERT INTO services (name, description, price, category, duration_minutes, display_order) 
SELECT 'Visite Guidée Médina', 'Découverte des souks et monuments avec guide certifié', 45.00, 'activité', 180, 5
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Visite Guidée Médina');

INSERT INTO services (name, description, price, category, duration_minutes, display_order) 
SELECT 'Cours de Cuisine', 'Apprentissage des secrets de la cuisine marocaine traditionnelle', 65.00, 'activité', 180, 6
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Cours de Cuisine');

-- Avis clients (éviter les doublons)
INSERT INTO reviews (author_name, rating, comment, author_country, is_featured) 
SELECT 'Sophie Martin', 5, 'Un séjour magique dans un cadre exceptionnel. Le personnel est aux petits soins !', 'France', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_name = 'Sophie Martin' AND comment LIKE 'Un séjour magique%');

INSERT INTO reviews (author_name, rating, comment, author_country, is_featured) 
SELECT 'Thomas Bernard', 4, 'Excellent rapport qualité-prix. La terrasse de la chambre Deluxe est magnifique au coucher du soleil.', 'Belgique', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_name = 'Thomas Bernard' AND comment LIKE 'Excellent rapport qualité-prix%');

INSERT INTO reviews (author_name, rating, comment, author_country, is_featured) 
SELECT 'Maria Rodriguez', 5, 'Notre voyage de noces a été parfait. La Suite Royale est somptueuse et le service impeccable.', 'Espagne', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_name = 'Maria Rodriguez' AND comment LIKE 'Notre voyage de noces%');

INSERT INTO reviews (author_name, rating, comment, author_country, is_featured) 
SELECT 'Ahmed Khalil', 5, 'Authenticité et modernité. Un vrai havre de paix au cœur de Marrakech.', 'Maroc', FALSE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_name = 'Ahmed Khalil' AND comment LIKE 'Authenticité et modernité%');

INSERT INTO reviews (author_name, rating, comment, author_country, is_featured) 
SELECT 'Emma Johnson', 5, 'The family suite was perfect for our needs. Kids loved the pool and the staff was wonderful.', 'USA', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_name = 'Emma Johnson' AND comment LIKE 'The family suite%');

-- Activer RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public can view available rooms" ON rooms;
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create contact messages" ON contact_messages;

-- Créer de nouvelles politiques RLS
CREATE POLICY "Public can view available rooms" ON rooms FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
SQL
)

# Exécuter le SQL via l'API REST
echo "🗃️  Exécution du schéma SQL..."
echo "$SQL" | curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @- && echo "✅ Schéma créé avec succès"

# Créer le fichier .env.local
echo "⚙️  Création du fichier .env.local..."

cat > .env.local << ENV
# ============================================================================
# CONFIGURATION SUPABASE EXISTANT - RIAD DAR AL ANDALUS
# ============================================================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Application
NEXT_PUBLIC_SITE_URL=https://votre-riad.com
NEXT_PUBLIC_APP_NAME="Riad Dar Al Andalus"
NEXT_PUBLIC_APP_DESCRIPTION="Un riad d'exception au cœur de Marrakech"

# Contact
NEXT_PUBLIC_CONTACT_EMAIL=contact@riad-al-andalus.com
NEXT_PUBLIC_CONTACT_PHONE="+212 5 24 38 94 12"
NEXT_PUBLIC_WHATSAPP_NUMBER="+212 6 61 23 45 67"

# Features
NEXT_PUBLIC_ENABLE_BOOKING=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_CONTACT=true

# Social
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/riadalarablus
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/riadalarablus

# Google Maps (optionnel)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_api
ENV

echo "✅ Fichier .env.local créé"
echo ""

# Créer le client Supabase
mkdir -p src/lib
cat > src/lib/supabase.ts << 'TS'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
TS

echo "✅ Client Supabase créé"
echo ""

# Créer un fichier type definitions
cat > src/lib/database.types.ts << 'TS'
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: number
          name: string
          description: string | null
          category: 'standard' | 'deluxe' | 'suite' | 'family'
          price: number
          size_m2: number | null
          capacity: number
          amenities: string[]
          images: string[]
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          category: 'standard' | 'deluxe' | 'suite' | 'family'
          price: number
          size_m2?: number | null
          capacity?: number
          amenities?: string[]
          images?: string[]
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          category?: 'standard' | 'deluxe' | 'suite' | 'family'
          price?: number
          size_m2?: number | null
          capacity?: number
          amenities?: string[]
          images?: string[]
          is_available?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: number
          booking_code: string
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_country: string | null
          check_in: string
          check_out: string
          room_type: string
          adults: number
          children: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests: string | null
          language: string
          created_at: string
        }
        Insert: {
          id?: number
          booking_code?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_country?: string | null
          check_in: string
          check_out: string
          room_type: string
          adults?: number
          children?: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          language?: string
          created_at?: string
        }
        Update: {
          id?: number
          booking_code?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          customer_country?: string | null
          check_in?: string
          check_out?: string
          room_type?: string
          adults?: number
          children?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          language?: string
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          author_name: string
          rating: number
          comment: string
          author_country: string | null
          is_featured: boolean
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: number
          author_name: string
          rating: number
          comment: string
          author_country?: string | null
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          author_name?: string
          rating?: number
          comment?: string
          author_country?: string | null
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          category: string
          duration_minutes: number | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          category: string
          duration_minutes?: number | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          category?: string
          duration_minutes?: number | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      availability: {
        Row: {
          id: number
          room_id: number | null
          date: string
          price: number | null
          is_available: boolean
        }
        Insert: {
          id?: number
          room_id?: number | null
          date: string
          price?: number | null
          is_available?: boolean
        }
        Update: {
          id?: number
          room_id?: number | null
          date?: string
          price?: number | null
          is_available?: boolean
        }
      }
    }
  }
}
TS

echo "✅ Types TypeScript créés"
echo ""

# Afficher le résumé
echo "================================================"
echo "🎉 SUPABASE EXISTANT CONFIGURÉ AVEC SUCCÈS !"
echo "================================================"
echo ""
echo "📊 INSTANCE CONFIGURÉE :"
echo "   URL : $SUPABASE_URL"
echo "   Anon Key : ${SUPABASE_ANON_KEY:0:20}..."
echo ""
echo "🗃️  TABLES CRÉÉES/MISE À JOUR :"
echo "   • rooms - 4 types de chambres"
echo "   • bookings - Système de réservation"
echo "   • contact_messages - Formulaire de contact"
echo "   • reviews - 5 avis clients"
echo "   • services - 6 services additionnels"
echo "   • availability - Gestion des disponibilités"
echo ""
echo "🔐 SÉCURITÉ :"
echo "   • RLS (Row Level Security) activé"
echo "   • Politiques d'accès configurées"
echo ""
echo "🚀 POUR DÉMARRER :"
echo "   1. Installez les dépendances :"
echo "      npm install @supabase/supabase-js"
echo "   2. Lancez Next.js :"
echo "      npm run dev"
echo "   3. Ouvrez : http://localhost:3000"
echo ""
echo "💡 ACCÈS ADMIN :"
echo "   • Allez sur : $SUPABASE_URL"
echo "   • Utilisez l'interface Table Editor"
echo "   • Vérifiez vos tables dans la section 'Table Editor'"
echo ""
echo "⚠️  IMPORTANT :"
echo "   • Vérifiez que votre Anon Key est correcte"
echo "   • Les données seront insérées seulement si elles n'existent pas déjà"
echo "   • Vous pouvez modifier les données via l'interface Supabase"
echo "================================================"

# Instructions pour vérifier
echo ""
echo "📋 VÉRIFICATION :"
echo "1. Allez sur : $SUPABASE_URL"
echo "2. Connectez-vous avec votre compte Supabase"
echo "3. Vérifiez les tables dans 'Table Editor'"
echo "4. Testez l'API dans 'API Docs'"