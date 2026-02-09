#!/bin/bash

# ============================================================================
# SCRIPT DE MISE À JOUR SUPABASE - MÉTHODE CORRECTE
# ============================================================================

echo "🏨 Mise à jour de Supabase existant pour Riad Dar Al Andalus"
echo ""

# Configuration de votre instance existante
export SUPABASE_URL="https://sjbwgvvnwhqharmpbmun.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYndndnZud2hxaGFybXBibXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDMyMjEsImV4cCI6MjA4MzM3OTIyMX0.fA-rPz6g4rC64r9ye-82j7Xcc10PrRo9Lb6Q6WqKqps"

# Obtenir votre Service Role Key depuis Supabase Dashboard
# Settings > API > Project API keys > service_role (secret)
export SUPABASE_SERVICE_KEY="sb_secret_fwtFWauLNPC67IBFKysO0g_l2sXCPS1eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYndndnZud2hxaGFybXBibXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMzIyMSwiZXhwIjoyMDgzMzc5MjIxfQ.iajmjYoC-WU27fsQGCy6e4jJUZFRo68ZHdVfXM3viYE"

# Vérifier les variables d'environnement
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Variables Supabase non définies"
    exit 1
fi

echo "🔗 Connexion à l'instance Supabase existante..."
echo "URL: $SUPABASE_URL"
echo ""

# ============================================================================
# MÉTHODE 1 : VIA L'ÉDITEUR SQL EN LIGNE (RECOMMANDÉ)
# ============================================================================

echo "📋 Instructions pour créer les tables MANUELLEMENT :"
echo ""
echo "1. Allez sur : ${SUPABASE_URL}"
echo "2. Connectez-vous avec votre compte Supabase"
echo "3. Cliquez sur 'SQL Editor' dans le menu de gauche"
echo "4. Copiez-collez le SQL ci-dessous"
echo "5. Cliquez sur 'Run'"
echo ""

# Afficher le SQL à copier-coller
cat << 'SQL'
-- ============================================================================
-- MISE À JOUR COMPLÈTE POUR RIAD DAR AL ANDALUS
-- ============================================================================

-- 1. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    date_of_birth DATE,
    preferences JSONB DEFAULT '{
        "newsletter": true,
        "language": "fr",
        "currency": "EUR",
        "notifications": {
            "email": true,
            "sms": false,
            "whatsapp": true
        }
    }',
    loyalty_points INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can create profiles" ON profiles;
CREATE POLICY "Public can create profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Ajouter des colonnes à la table rooms si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter room_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'room_number') THEN
        ALTER TABLE rooms ADD COLUMN room_number VARCHAR(10) UNIQUE;
    END IF;
    
    -- Ajouter bed_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'bed_type') THEN
        ALTER TABLE rooms ADD COLUMN bed_type VARCHAR(20) DEFAULT 'double';
    END IF;
    
    -- Ajouter has_balcony
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'has_balcony') THEN
        ALTER TABLE rooms ADD COLUMN has_balcony BOOLEAN DEFAULT false;
    END IF;
    
    -- Ajouter has_terrace
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'has_terrace') THEN
        ALTER TABLE rooms ADD COLUMN has_terrace BOOLEAN DEFAULT false;
    END IF;
    
    -- Ajouter has_jacuzzi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'has_jacuzzi') THEN
        ALTER TABLE rooms ADD COLUMN has_jacuzzi BOOLEAN DEFAULT false;
    END IF;
    
    -- Ajouter featured_image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'featured_image_url') THEN
        ALTER TABLE rooms ADD COLUMN featured_image_url TEXT;
    END IF;
    
    -- Ajouter updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'updated_at') THEN
        ALTER TABLE rooms ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Mettre à jour les numéros de chambre
UPDATE rooms 
SET room_number = 
    CASE 
        WHEN name LIKE '%Standard%' THEN 'S101'
        WHEN name LIKE '%Deluxe%' THEN 'D201'
        WHEN name LIKE '%Suite Royale%' THEN 'SR301'
        WHEN name LIKE '%Suite Familiale%' THEN 'SF401'
        ELSE 'CH' || id::TEXT
    END
WHERE room_number IS NULL;

-- Mettre à jour les équipements booléens
UPDATE rooms 
SET has_terrace = true 
WHERE EXISTS (
    SELECT 1 FROM unnest(amenities) AS amenity 
    WHERE amenity LIKE '%Terrasse%' OR amenity LIKE '%terrace%'
);

UPDATE rooms 
SET has_jacuzzi = true 
WHERE EXISTS (
    SELECT 1 FROM unnest(amenities) AS amenity 
    WHERE amenity LIKE '%Jacuzzi%' OR amenity LIKE '%jacuzzi%'
);

-- 3. Ajouter des colonnes à la table bookings
DO $$ 
BEGIN
    -- Ajouter guest_first_name et guest_last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'guest_first_name') THEN
        ALTER TABLE bookings ADD COLUMN guest_first_name VARCHAR(100);
        ALTER TABLE bookings ADD COLUMN guest_last_name VARCHAR(100);
        
        -- Remplir avec les données existantes
        UPDATE bookings 
        SET guest_first_name = split_part(customer_name, ' ', 1),
            guest_last_name = split_part(customer_name, ' ', 2)
        WHERE guest_first_name IS NULL;
    END IF;
    
    -- Ajouter profile_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'profile_id') THEN
        ALTER TABLE bookings ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Ajouter room_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'room_id') THEN
        ALTER TABLE bookings ADD COLUMN room_id BIGINT REFERENCES rooms(id) ON DELETE RESTRICT;
    END IF;
    
    -- Ajouter payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Ajouter amount_paid
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'amount_paid') THEN
        ALTER TABLE bookings ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Ajouter updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'updated_at') THEN
        ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Ajouter les timestamps d'événements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'confirmed_at') THEN
        ALTER TABLE bookings ADD COLUMN confirmed_at TIMESTAMP;
        ALTER TABLE bookings ADD COLUMN checked_in_at TIMESTAMP;
        ALTER TABLE bookings ADD COLUMN checked_out_at TIMESTAMP;
    END IF;
END $$;

-- 4. Créer la table des services réservés
CREATE TABLE IF NOT EXISTS booking_services (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id) ON DELETE RESTRICT,
    
    -- Détails de la réservation
    service_date DATE NOT NULL,
    service_time TIME,
    participants_count INTEGER DEFAULT 1,
    
    -- Prix
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (unit_price * participants_count) STORED,
    
    -- Statut
    status VARCHAR(20) DEFAULT 'confirmed',
    
    -- Notes
    special_requests TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour booking_services
DROP POLICY IF EXISTS "Public can create booking services" ON booking_services;
CREATE POLICY "Public can create booking services" ON booking_services
    FOR INSERT WITH CHECK (true);

-- 5. Créer la table de la galerie
CREATE TABLE IF NOT EXISTS gallery (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    
    -- Image
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    
    -- Métadonnées
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    
    -- Ordre d'affichage
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour gallery
DROP POLICY IF EXISTS "Public can view published gallery" ON gallery;
CREATE POLICY "Public can view published gallery" ON gallery
    FOR SELECT USING (is_published = true);

-- 6. Créer la table des réductions
CREATE TABLE IF NOT EXISTS discounts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Type de réduction
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'nights')),
    value DECIMAL(10,2) NOT NULL,
    applies_to VARCHAR(20) DEFAULT 'all' CHECK (applies_to IN ('all', 'room_only', 'services_only')),
    
    -- Conditions
    min_stay_nights INTEGER,
    max_stay_nights INTEGER,
    min_amount DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Limitations
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Public ou privé
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour discounts
DROP POLICY IF EXISTS "Public can view active discounts" ON discounts;
CREATE POLICY "Public can view active discounts" ON discounts
    FOR SELECT USING (is_active = true AND is_public = true AND valid_until >= CURRENT_DATE);

-- 7. Créer la table des configurations
CREATE TABLE IF NOT EXISTS configurations (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour configurations
DROP POLICY IF EXISTS "Public can view configurations" ON configurations;
CREATE POLICY "Public can view configurations" ON configurations
    FOR SELECT USING (true);

-- 8. Créer la table des pages statiques
CREATE TABLE IF NOT EXISTS pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[] DEFAULT '{}',
    
    -- Statut
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour pages
DROP POLICY IF EXISTS "Public can view published pages" ON pages;
CREATE POLICY "Public can view published pages" ON pages
    FOR SELECT USING (is_published = true);

-- 9. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers pour updated_at
DO $$ 
BEGIN
    -- Pour rooms
    DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
    CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    -- Pour bookings
    DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
    CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- 11. Fonction pour vérifier la disponibilité
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id BIGINT,
    p_check_in DATE,
    p_check_out DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    overlapping_bookings INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO overlapping_bookings
    FROM bookings
    WHERE room_id = p_room_id
    AND status NOT IN ('cancelled', 'no_show')
    AND check_in < p_check_out
    AND check_out > p_check_in;
    
    RETURN overlapping_bookings = 0;
END;
$$ language 'plpgsql';

-- 12. Fonction pour calculer le prix
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_room_id BIGINT,
    p_check_in DATE,
    p_check_out DATE,
    p_adults_count INTEGER DEFAULT 2,
    p_children_count INTEGER DEFAULT 0
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_nights INTEGER;
    v_base_price DECIMAL(10,2);
    v_total_price DECIMAL(10,2);
    v_current_date DATE;
    v_daily_price DECIMAL(10,2);
BEGIN
    v_nights := p_check_out - p_check_in;
    
    -- Prix de base par nuit
    SELECT price INTO v_base_price
    FROM rooms WHERE id = p_room_id;
    
    v_total_price := 0;
    v_current_date := p_check_in;
    
    -- Calcul jour par jour
    FOR i IN 1..v_nights LOOP
        -- Vérifier s'il y a un prix spécifique pour cette date
        SELECT COALESCE(price, v_base_price)
        INTO v_daily_price
        FROM availability
        WHERE room_id = p_room_id AND date = v_current_date;
        
        v_total_price := v_total_price + v_daily_price;
        v_current_date := v_current_date + 1;
    END LOOP;
    
    -- Supplément pour personne supplémentaire
    IF p_adults_count > 2 THEN
        v_total_price := v_total_price + (p_adults_count - 2) * 20 * v_nights;
    END IF;
    
    -- Supplément pour enfants
    IF p_children_count > 0 THEN
        v_total_price := v_total_price + p_children_count * 10 * v_nights;
    END IF;
    
    RETURN v_total_price;
END;
$$ language 'plpgsql';

-- 13. Insérer des données de démonstration

-- Galerie
INSERT INTO gallery (title, description, category, image_url, is_featured, display_order, is_published) VALUES
('Patio avec Fontaine', 'Notre magnifique patio central avec fontaine traditionnelle en zellige.', 'architecture', '/images/gallery/patio-1.jpg', true, 1, true),
('Suite Royale - Chambre', 'La chambre principale de notre suite royale avec lit king size.', 'chambres', '/images/gallery/suite-bedroom.jpg', true, 2, true),
('Jardin & Piscine', 'Notre oasis de tranquillité avec piscine et végétation luxuriante.', 'jardin', '/images/gallery/pool.jpg', true, 3, true),
('Restaurant aux Chandelles', 'Notre restaurant décoré pour un dîner romantique aux chandelles.', 'restaurant', '/images/gallery/restaurant.jpg', false, 4, true),
('Spa Hammam', 'Notre hammam traditionnel avec salle de relaxation.', 'spa', '/images/gallery/hammam.jpg', false, 5, true)
ON CONFLICT DO NOTHING;

-- Réductions
INSERT INTO discounts (code, name, description, discount_type, value, applies_to, min_stay_nights, valid_from, valid_until, is_active, is_public) VALUES
('RIAD10', 'Réduction de Bienvenue', '10% de réduction sur votre premier séjour', 'percentage', 10.00, 'all', 1, '2024-01-01', '2024-12-31', true, true),
('LONGSTAY', 'Séjour Long', '15% de réduction pour les séjours de 7 nuits ou plus', 'percentage', 15.00, 'room_only', 7, '2024-01-01', '2024-12-31', true, true),
('EARLYBIRD', 'Réservation Anticipée', 'Réduction pour réservation 60 jours à l''avance', 'percentage', 12.00, 'all', 2, '2024-01-01', '2024-12-31', true, true)
ON CONFLICT (code) DO NOTHING;

-- Configurations
INSERT INTO configurations (key, value, description, category) VALUES
('site_name', '"Riad Dar Al Andalus"', 'Nom du site', 'general'),
('contact_email', '"contact@riad-al-andalus.com"', 'Email de contact principal', 'contact'),
('contact_phone', '"+212 5 24 38 94 12"', 'Téléphone principal', 'contact'),
('whatsapp_number', '"+212 6 61 23 45 67"', 'Numéro WhatsApp', 'contact'),
('address', '["Derb Sidi Bouloukat", "Médina", "Marrakech 40000", "Maroc"]', 'Adresse complète', 'contact'),
('check_in_time', '"14:00"', 'Heure de check-in', 'reservations'),
('check_out_time', '"12:00"', 'Heure de check-out', 'reservations'),
('currency', '"EUR"', 'Devise principale', 'pricing'),
('tax_rate', '0.1', 'Taux de TVA (10%)', 'pricing')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pages statiques
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published) VALUES
('mentions-legales', 'Mentions Légales', '<h1>Mentions Légales</h1><p>Contenu des mentions légales...</p>', 'Mentions Légales - Riad Dar Al Andalus', 'Mentions légales du Riad Dar Al Andalus à Marrakech', true),
('politique-confidentialite', 'Politique de Confidentialité', '<h1>Politique de Confidentialité</h1><p>Contenu de la politique de confidentialité...</p>', 'Politique de Confidentialité - Riad Dar Al Andalus', 'Politique de confidentialité du Riad Dar Al Andalus', true),
('conditions-generales', 'Conditions Générales', '<h1>Conditions Générales d''Utilisation</h1><p>Contenu des CGU...</p>', 'Conditions Générales - Riad Dar Al Andalus', 'Conditions générales d''utilisation du site et de réservation', true)
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();

-- 14. Vue pour les chambres disponibles
CREATE OR REPLACE VIEW available_rooms AS
SELECT 
    r.*,
    a.date,
    COALESCE(a.price, r.price) as daily_price,
    COALESCE(a.is_available, true) as is_available
FROM rooms r
LEFT JOIN availability a ON r.id = a.room_id
WHERE r.is_available = true;

-- ============================================================================
-- FIN DU SCRIPT SQL
-- ============================================================================
SQL

echo ""
echo "📁 Ou utilisez l'alternative avec Supabase CLI :"
echo ""

# ============================================================================
# MÉTHODE 2 : VIA SUPABASE CLI (SI INSTALLÉ)
# ============================================================================

if command -v supabase &> /dev/null; then
    echo "⚡ Méthode avec Supabase CLI disponible"
    echo ""
    echo "1. Lier votre projet :"
    echo "   supabase link --project-ref sjbwgvvnwhqharmpbmun"
    echo ""
    echo "2. Créer un fichier migration :"
    echo "   mkdir -p supabase/migrations"
    echo "   nano supabase/migrations/20240101000000_riad_complete_schema.sql"
    echo ""
    echo "3. Copier le SQL ci-dessus dans ce fichier"
    echo ""
    echo "4. Pousser les changements :"
    echo "   supabase db push"
else
    echo "⚠️  Supabase CLI non installé"
    echo "   Installation : npm install -g supabase"
fi

# ============================================================================
# MÉTHODE 3 : VIA L'API DIRECTE (AVEC SERVICE ROLE KEY)
# ============================================================================

echo ""
echo "🔐 Méthode avec API directe (nécessite Service Role Key) :"
echo ""
echo "1. Récupérez votre Service Role Key :"
echo "   - Allez sur : ${SUPABASE_URL}"
echo "   - Settings > API > Project API keys"
echo "   - Copiez 'service_role' (secret)"
echo ""
echo "2. Exécutez ce curl avec votre clé :"
echo ""
cat << CURL
curl -X POST '${SUPABASE_URL}/rest/v1/' \\
  -H 'apikey: ${SUPABASE_ANON_KEY}' \\
  -H 'Authorization: Bearer VOTRE_SERVICE_ROLE_KEY' \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: return=minimal' \\
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT);"
  }'
CURL

# ============================================================================
# CRÉATION DES FICHIERS DE CONFIGURATION
# ============================================================================

echo -e "\n📁 Création des fichiers de configuration..."

# Créer le dossier si nécessaire
mkdir -p src/lib/supabase

# Créer le fichier .env.local
cat > .env.local << ENV
# ============================================================================
# CONFIGURATION SUPABASE - RIAD DAR AL ANDALUS
# ============================================================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
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
NEXT_PUBLIC_ENABLE_GALLERY=true
NEXT_PUBLIC_ENABLE_SERVICES=true

# Social
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/riadalarablus
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/riadalarablus

# API Keys (optionnel)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
ENV

echo "✅ .env.local créé"

# Créer les types TypeScript
cat > src/lib/supabase/types.ts << 'TS'
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
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          country: string | null
          city: string | null
          address: string | null
          postal_code: string | null
          date_of_birth: string | null
          preferences: Json | null
          loyalty_points: number | null
          is_vip: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          preferences?: Json | null
          loyalty_points?: number | null
          is_vip?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          preferences?: Json | null
          loyalty_points?: number | null
          is_vip?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: number
          room_number: string | null
          name: string
          description: string | null
          category: 'standard' | 'deluxe' | 'suite' | 'family'
          price: number
          size_m2: number | null
          capacity: number
          amenities: string[]
          images: string[]
          is_available: boolean
          bed_type: string | null
          has_balcony: boolean | null
          has_terrace: boolean | null
          has_jacuzzi: boolean | null
          featured_image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          room_number?: string | null
          name: string
          description?: string | null
          category: 'standard' | 'deluxe' | 'suite' | 'family'
          price: number
          size_m2?: number | null
          capacity?: number
          amenities?: string[]
          images?: string[]
          is_available?: boolean
          bed_type?: string | null
          has_balcony?: boolean | null
          has_terrace?: boolean | null
          has_jacuzzi?: boolean | null
          featured_image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          room_number?: string | null
          name?: string
          description?: string | null
          category?: 'standard' | 'deluxe' | 'suite' | 'family'
          price?: number
          size_m2?: number | null
          capacity?: number
          amenities?: string[]
          images?: string[]
          is_available?: boolean
          bed_type?: string | null
          has_balcony?: boolean | null
          has_terrace?: boolean | null
          has_jacuzzi?: boolean | null
          featured_image_url?: string | null
          created_at?: string
          updated_at?: string | null
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
          guest_first_name: string | null
          guest_last_name: string | null
          profile_id: string | null
          room_id: number | null
          payment_status: string | null
          amount_paid: number | null
          confirmed_at: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          updated_at: string | null
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
          guest_first_name?: string | null
          guest_last_name?: string | null
          profile_id?: string | null
          room_id?: number | null
          payment_status?: string | null
          amount_paid?: number | null
          confirmed_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string | null
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
          guest_first_name?: string | null
          guest_last_name?: string | null
          profile_id?: string | null
          room_id?: number | null
          payment_status?: string | null
          amount_paid?: number | null
          confirmed_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string | null
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
      booking_services: {
        Row: {
          id: number
          booking_id: number
          service_id: number
          service_date: string
          service_time: string | null
          participants_count: number
          unit_price: number
          total_price: number
          status: string | null
          special_requests: string | null
          created_at: string
        }
        Insert: {
          id?: number
          booking_id: number
          service_id: number
          service_date: string
          service_time?: string | null
          participants_count?: number
          unit_price: number
          status?: string | null
          special_requests?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          booking_id?: number
          service_id?: number
          service_date?: string
          service_time?: string | null
          participants_count?: number
          unit_price?: number
          status?: string | null
          special_requests?: string | null
          created_at?: string
        }
      }
      gallery: {
        Row: {
          id: number
          title: string
          description: string | null
          category: string
          image_url: string
          thumbnail_url: string | null
          alt_text: string | null
          width: number | null
          height: number | null
          size_bytes: number | null
          display_order: number | null
          is_featured: boolean | null
          is_published: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          category: string
          image_url: string
          thumbnail_url?: string | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          display_order?: number | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          category?: string
          image_url?: string
          thumbnail_url?: string | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          display_order?: number | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_at?: string
        }
      }
      discounts: {
        Row: {
          id: number
          code: string
          name: string
          description: string | null
          discount_type: string
          value: number
          applies_to: string | null
          min_stay_nights: number | null
          max_stay_nights: number | null
          min_amount: number | null
          valid_from: string
          valid_until: string
          usage_limit: number | null
          times_used: number | null
          is_active: boolean | null
          is_public: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          description?: string | null
          discount_type: string
          value: number
          applies_to?: string | null
          min_stay_nights?: number | null
          max_stay_nights?: number | null
          min_amount?: number | null
          valid_from: string
          valid_until: string
          usage_limit?: number | null
          times_used?: number | null
          is_active?: boolean | null
          is_public?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          name?: string
          description?: string | null
          discount_type?: string
          value?: number
          applies_to?: string | null
          min_stay_nights?: number | null
          max_stay_nights?: number | null
          min_amount?: number | null
          valid_from?: string
          valid_until?: string
          usage_limit?: number | null
          times_used?: number | null
          is_active?: boolean | null
          is_public?: boolean | null
          created_at?: string
        }
      }
      configurations: {
        Row: {
          key: string
          value: Json
          description: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: number
          slug: string
          title: string
          content: string
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          is_published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          title: string
          content: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          content?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      available_rooms: {
        Row: {
          id: number | null
          room_number: string | null
          name: string | null
          description: string | null
          category: string | null
          price: number | null
          size_m2: number | null
          capacity: number | null
          amenities: string[] | null
          images: string[] | null
          is_available: boolean | null
          bed_type: string | null
          has_balcony: boolean | null
          has_terrace: boolean | null
          has_jacuzzi: boolean | null
          featured_image_url: string | null
          created_at: string | null
          updated_at: string | null
          date: string | null
          daily_price: number | null
        }
      }
    }
    Functions: {
      check_room_availability: {
        Args: {
          p_room_id: number
          p_check_in: string
          p_check_out: string
        }
        Returns: boolean
      }
      calculate_booking_price: {
        Args: {
          p_room_id: number
          p_check_in: string
          p_check_out: string
          p_adults_count?: number
          p_children_count?: number
        }
        Returns: number
      }
    }
  }
}
TS

echo "✅ Types TypeScript créés"

# Créer le client Supabase
cat > src/lib/supabase/client.ts << 'TS'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
TS

# Créer le fichier de services
cat > src/lib/supabase/services.ts << 'TS'
import { createClient } from './client'

// Service pour les chambres
export const roomService = {
  async getAvailableRooms(checkIn: string, checkOut: string, guests: number = 2) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('available_rooms')
      .select('*')
      .gte('date', checkIn)
      .lt('date', checkOut)
      .eq('is_available', true)
      .gte('capacity', guests)
    
    if (error) throw error
    return data
  },
  
  async getRoomDetails(roomId: number) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Service pour les réservations
export const bookingService = {
  async createBooking(bookingData: any) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Service pour les contacts
export const contactService = {
  async sendMessage(messageData: any) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
TS

echo "✅ Services créés"

# ============================================================================
# RÉCAPITULATIF
# ============================================================================

echo -e "\n${GREEN}"
echo "============================================================================"
echo "📋 INSTRUCTIONS POUR CRÉER LES TABLES"
echo "============================================================================"
echo -e "${NC}"

echo ""
echo "🎯 MÉTHODE LA PLUS SIMPLE :"
echo "1. ${BLUE}Allez sur : ${SUPABASE_URL}/project/default/sql${NC}"
echo "2. ${BLUE}Copiez tout le SQL affiché ci-dessus${NC}"
echo "3. ${BLUE}Collez dans l'éditeur SQL${NC}"
echo "4. ${BLUE}Cliquez sur 'Run'${NC}"
echo ""

echo "📊 TABLES QUI SERONT CRÉÉES :"
echo "   ✅ profiles          - Profils utilisateurs"
echo "   ✅ booking_services  - Services réservés"
echo "   ✅ gallery           - Galerie photos (5 images)"
echo "   ✅ discounts         - Codes promo (3 codes)"
echo "   ✅ configurations    - Configuration du site"
echo "   ✅ pages             - Pages statiques"
echo ""
echo "🔧 AMÉLIORATIONS :"
echo "   ✅ rooms             - 7 colonnes ajoutées"
echo "   ✅ bookings          - 9 colonnes ajoutées"
echo "   ✅ 2 fonctions       - Calcul prix & disponibilité"
echo "   ✅ 2 triggers        - Mise à jour automatique"
echo "   ✅ 1 vue             - Chambres disponibles"
echo ""

echo "📁 FICHIERS CRÉÉS POUR NEXT.JS :"
echo "   ✅ .env.local        - Configuration"
echo "   ✅ src/lib/supabase/ - Client et services"
echo ""

echo "🚀 POUR TESTER :"
echo "1. ${YELLOW}npm install @supabase/supabase-js${NC}"
echo "2. ${YELLOW}npm run dev${NC}"
echo "3. ${YELLOW}Ouvrez http://localhost:3000${NC}"
echo ""

echo "🔗 LIENS UTILES :"
echo "   🌐 Supabase : ${SUPABASE_URL}"
echo "   📊 Table Editor : ${SUPABASE_URL}/project/default/editor"
echo "   📚 Documentation : https://supabase.com/docs"
echo ""

echo "✨ Une fois les tables créées, votre backend sera complet !"