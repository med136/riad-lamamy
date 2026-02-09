#!/bin/bash

# ============================================================================
# SCRIPT DE CONFIGURATION SUPABASE POUR RIAD DAR AL ANDALUS (CORRIGÉ)
# ============================================================================
# Ce script configure un backend complet sur Supabase pour le site de riad
# Inspiré de: https://www.riaddarhamid.com/fr/
# ============================================================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================================"
echo "CONFIGURATION SUPABASE - RIAD DAR AL ANDALUS"
echo "============================================================================"
echo -e "${NC}"

# ============================================================================
# 1. INSTALLATION DE SUPABASE CLI (MÉTHODE CORRECTE)
# ============================================================================

echo -e "\n${BLUE}1. INSTALLATION DE SUPABASE CLI${NC}"

# Vérifier si supabase-cli est déjà installé
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}🔍 Installation de Supabase CLI...${NC}"
    
    # Méthode alternative d'installation (choisissez une option)
    
    # Option 1: Installation via Homebrew (Mac)
    if command -v brew &> /dev/null; then
        echo -e "${GREEN}📦 Installation via Homebrew...${NC}"
        brew install supabase/tap/supabase
        
    # Option 2: Installation via Scoop (Windows)
    elif command -v scoop &> /dev/null; then
        echo -e "${GREEN}📦 Installation via Scoop...${NC}"
        scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
        scoop install supabase
        
    # Option 3: Installation directe (Linux/Mac/Windows WSL)
    else
        echo -e "${GREEN}📦 Installation directe...${NC}"
        
        # Détecter l'OS
        OS="$(uname -s)"
        ARCH="$(uname -m)"
        
        case "${OS}" in
            Linux*)
                echo -e "${YELLOW}📥 Téléchargement pour Linux...${NC}"
                # Télécharger la dernière version
                LATEST_VERSION=$(curl -s https://api.github.com/repos/supabase/cli/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
                curl -L "https://github.com/supabase/cli/releases/download/${LATEST_VERSION}/supabase_${LATEST_VERSION:1}_linux_amd64.tar.gz" -o supabase.tar.gz
                tar -xzf supabase.tar.gz
                chmod +x supabase
                sudo mv supabase /usr/local/bin/
                rm supabase.tar.gz
                ;;
            Darwin*)
                echo -e "${YELLOW}📥 Téléchargement pour macOS...${NC}"
                LATEST_VERSION=$(curl -s https://api.github.com/repos/supabase/cli/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
                curl -L "https://github.com/supabase/cli/releases/download/${LATEST_VERSION}/supabase_${LATEST_VERSION:1}_darwin_amd64.tar.gz" -o supabase.tar.gz
                tar -xzf supabase.tar.gz
                chmod +x supabase
                sudo mv supabase /usr/local/bin/
                rm supabase.tar.gz
                ;;
            *)
                echo -e "${RED}❌ Système d'exploitation non supporté: ${OS}${NC}"
                echo -e "${YELLOW}📋 Veuillez installer manuellement:${NC}"
                echo "   Visitez: https://github.com/supabase/cli#installation"
                exit 1
                ;;
        esac
    fi
else
    echo -e "${GREEN}✅ Supabase CLI est déjà installé${NC}"
fi

# Vérifier si supabase-cli est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI n'est pas installé${NC}"
    echo -e "${YELLOW}📋 Veuillez l'installer manuellement :${NC}"
    echo ""
    echo "Pour installer Supabase CLI :"
    echo "--------------------------------"
    echo "📦 macOS (avec Homebrew):"
    echo "   brew install supabase/tap/supabase"
    echo ""
    echo "📦 Windows (avec Scoop):"
    echo "   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    echo "   scoop install supabase"
    echo ""
    echo "📦 Linux/WSL (téléchargement direct):"
    echo "   curl -fsSL https://github.com/supabase/cli/raw/main/install.sh | sh"
    echo ""
    echo "🔗 Documentation : https://supabase.com/docs/guides/cli"
    echo ""
    
    # Continuer quand même car l'utilisateur peut avoir installé après
    read -p "Avez-vous installé Supabase CLI ? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}📝 Le script va créer les fichiers de configuration sans exécuter les commandes Supabase.${NC}"
        echo -e "${YELLOW}   Vous pourrez les exécuter manuellement plus tard.${NC}"
    fi
else
    echo -e "${GREEN}✅ Supabase CLI est installé${NC}"
    supabase --version
fi

echo -e "${GREEN}✅ Supabase CLI installé avec succès${NC}"
supabase --version

# ============================================================================
# 2. INITIALISATION DU PROJET
# ============================================================================

echo -e "\n${BLUE}2. INITIALISATION DU PROJET SUPABASE${NC}"

# Vérifier si le projet Supabase existe déjà
if [ -d "supabase" ]; then
    echo -e "${YELLOW}⚠️  Le dossier supabase existe déjà${NC}"
    read -p "Voulez-vous le réinitialiser ? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Suppression de l'ancien projet...${NC}"
        rm -rf supabase
        supabase init
    else
        echo -e "${YELLOW}📁 Utilisation du projet existant${NC}"
    fi
else
    echo -e "${GREEN}📁 Initialisation du projet Supabase...${NC}"
    supabase init
fi

# ============================================================================
# 3. CRÉATION DU SCHÉMA DE BASE DE DONNÉES
# ============================================================================

echo -e "\n${BLUE}3. CRÉATION DU SCHÉMA DE BASE DE DONNÉES${NC}"

# Créer le répertoire des migrations s'il n'existe pas
mkdir -p supabase/migrations

# ============================================================================
# FICHIER SQL COMPLET POUR LE RIAD
# ============================================================================

SQL_FILE="supabase/migrations/$(date +%Y%m%d%H%M%S)_riad_complete_schema.sql"

cat > "$SQL_FILE" << 'SQL'
-- ============================================================================
-- SCHEMA COMPLET POUR RIAD DAR AL ANDALUS
-- ============================================================================

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TABLE DES UTILISATEURS (EXTENSION DE AUTH.USERS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- ============================================================================
-- 2. TABLE DES CHAMBRES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE room_category AS ENUM ('standard', 'deluxe', 'suite', 'family', 'presidentielle');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bed_type AS ENUM ('simple', 'double', 'king', 'queen', 'twin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'cleaning', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category room_category NOT NULL,
    size_m2 INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    weekend_surcharge DECIMAL(10,2) DEFAULT 0,
    seasonal_multiplier DECIMAL(10,2) DEFAULT 1.0,
    
    -- Caractéristiques
    bed_type bed_type NOT NULL,
    has_balcony BOOLEAN DEFAULT false,
    has_terrace BOOLEAN DEFAULT false,
    has_jacuzzi BOOLEAN DEFAULT false,
    has_kitchenette BOOLEAN DEFAULT false,
    view_type TEXT,
    
    -- Équipements
    amenities TEXT[] DEFAULT '{}',
    
    -- Images
    images_urls TEXT[] DEFAULT '{}',
    featured_image_url TEXT,
    
    -- Métat données
    status room_status DEFAULT 'available',
    cleaning_schedule JSONB,
    
    -- Statistiques
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 3. TABLE DES RÉSERVATIONS (VERSION CORRIGÉE)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    
    -- Client
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_first_name TEXT NOT NULL,
    guest_last_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_special_requests TEXT,
    
    -- Dates
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
    
    -- Chambre
    room_id UUID REFERENCES public.rooms(id) ON DELETE RESTRICT,
    room_number VARCHAR(10),
    room_category room_category,
    
    -- Participants
    adults_count INTEGER DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    children_ages INTEGER[] DEFAULT '{}',
    
    -- Prix (CORRECTION ICI : pas de colonne générée qui en référence une autre)
    base_price DECIMAL(10,2) NOT NULL,
    extra_services_price DECIMAL(10,2) DEFAULT 0,
    taxes_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Calcul manuel dans les requêtes plutôt que colonne générée
    -- total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    --     (base_price + extra_services_price + taxes_amount - discount_amount)
    -- ) STORED,
    
    -- Paiement (CORRECTION ICI)
    payment_status payment_status DEFAULT 'pending',
    amount_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Calcul manuel plutôt que colonne générée
    -- amount_due DECIMAL(10,2) GENERATED ALWAYS AS (
    --     (base_price + extra_services_price + taxes_amount - discount_amount) - amount_paid
    -- ) STORED,
    
    -- Statut
    status booking_status DEFAULT 'pending',
    
    -- Métadonnées
    source TEXT DEFAULT 'website',
    notes TEXT,
    cancellation_reason TEXT,
    
    -- Timestamps
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 4. TABLE DES SERVICES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE service_category AS ENUM ('restauration', 'spa', 'transport', 'activite', 'sur_mesure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_frequency AS ENUM ('unique', 'quotidien', 'hebdomadaire');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category service_category NOT NULL,
    
    -- Prix
    base_price DECIMAL(10,2) NOT NULL,
    price_unit TEXT DEFAULT 'per_person',
    is_included_in_room BOOLEAN DEFAULT false,
    
    -- Disponibilité
    frequency service_frequency DEFAULT 'unique',
    duration_minutes INTEGER,
    max_participants INTEGER,
    
    -- Images et détails
    image_url TEXT,
    details JSONB DEFAULT '{}',
    
    -- Métat données
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 5. TABLE DES SERVICES RÉSERVÉS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.booking_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
    
    -- Détails de la réservation
    service_date DATE NOT NULL,
    service_time TIME,
    participants_count INTEGER DEFAULT 1,
    
    -- Prix
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (unit_price * participants_count) STORED,
    
    -- Statut
    status TEXT DEFAULT 'confirmed',
    
    -- Notes
    special_requests TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 6. TABLE DES AVIS CLIENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Notation
    room_rating INTEGER CHECK (room_rating >= 1 AND room_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Calcul de la moyenne
    overall_rating DECIMAL(3,2) GENERATED ALWAYS AS (
        (COALESCE(room_rating, 0) + COALESCE(service_rating, 0) + 
         COALESCE(cleanliness_rating, 0) + COALESCE(location_rating, 0) + 
         COALESCE(value_rating, 0)) / 5.0
    ) STORED,
    
    -- Commentaires
    title TEXT,
    comment TEXT NOT NULL,
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Métat données
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 7. TABLE DES MESSAGES DE CONTACT
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE contact_subject AS ENUM ('reservation', 'information', 'service', 'reclamation', 'partenariat', 'autre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Expéditeur
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    
    -- Message
    subject contact_subject NOT NULL,
    message TEXT NOT NULL,
    
    -- Réservation associée
    booking_reference TEXT,
    check_in_date DATE,
    check_out_date DATE,
    
    -- Traitement
    status TEXT DEFAULT 'new',
    assigned_to UUID REFERENCES auth.users(id),
    notes TEXT,
    
    -- Métadonnées
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 8. TABLE DES DISPONIBILITÉS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Prix dynamique
    price DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    
    -- Raison d'indisponibilité
    block_reason TEXT,
    
    -- Contrainte d'unicité
    UNIQUE(room_id, date)
);

-- ============================================================================
-- 9. TABLE DES TARIFS SPÉCIAUX
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'nights');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_applies_to AS ENUM ('all', 'room_only', 'services_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Type de réduction
    discount_type discount_type NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    applies_to discount_applies_to DEFAULT 'all',
    
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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 10. TABLE DES GALERIES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE gallery_category AS ENUM ('chambres', 'restaurant', 'spa', 'jardin', 'piscine', 'evenement', 'architecture');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category gallery_category NOT NULL,
    
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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 11. TABLE DES PAGES STATIQUES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[] DEFAULT '{}',
    
    -- Statut
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 12. TABLE DES CONFIGURATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.configurations (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les recherches de disponibilité
CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_room_date ON public.availability(room_id, date);

-- Index pour les réservations
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='check_in_date') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='guest_email') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON public.bookings(guest_email);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_reference') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
    END IF;
END $$;

-- Index pour les chambres
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='category') THEN
        CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='status') THEN
        CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
    END IF;
END $$;

-- Index pour les avis
CREATE INDEX IF NOT EXISTS idx_reviews_overall_rating ON public.reviews(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

-- Index pour les messages de contact
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at') THEN
        CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
        CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
        CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_messages_updated_at') THEN
        CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pages_updated_at') THEN
        CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_configurations_updated_at') THEN
        CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON public.configurations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Fonction pour générer une référence de réservation
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    year_code CHAR(2);
    month_code CHAR(1);
    seq_number INTEGER;
    new_reference VARCHAR(20);
BEGIN
    -- Code année (2 derniers chiffres)
    year_code := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Code mois (A-L pour Jan-Déc)
    month_code := CHR(64 + EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
    
    -- Numéro séquentiel du mois
    SELECT COALESCE(MAX(SUBSTRING(booking_reference FROM 4 FOR 4)::INTEGER), 0) + 1
    INTO seq_number
    FROM public.bookings
    WHERE booking_reference LIKE year_code || month_code || '%';
    
    -- Format: YYMLNNNN (ex: 24D0001)
    new_reference := year_code || month_code || LPAD(seq_number::TEXT, 4, '0');
    
    NEW.booking_reference := new_reference;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_booking_reference') THEN
        CREATE TRIGGER set_booking_reference BEFORE INSERT ON public.bookings
            FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();
    END IF;
END $$;

-- Fonction pour vérifier la disponibilité d'une chambre
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    overlapping_bookings INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO overlapping_bookings
    FROM public.bookings
    WHERE room_id = p_room_id
    AND status NOT IN ('cancelled', 'no_show')
    AND check_in_date < p_check_out
    AND check_out_date > p_check_in;
    
    RETURN overlapping_bookings = 0;
END;
$$ language 'plpgsql';

-- Fonction pour calculer le prix d'un séjour
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_adults_count INTEGER,
    p_children_count INTEGER
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
    SELECT base_price_per_night INTO v_base_price
    FROM public.rooms WHERE id = p_room_id;
    
    v_total_price := 0;
    v_current_date := p_check_in;
    
    -- Calcul jour par jour
    FOR i IN 1..v_nights LOOP
        -- Vérifier s'il y a un prix spécifique pour cette date
        SELECT COALESCE(price, v_base_price)
        INTO v_daily_price
        FROM public.availability
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
SQL

echo -e "${GREEN}✅ Schéma SQL créé: ${SQL_FILE}${NC}"

# ============================================================================
# 4. CRÉATION DES DONNÉES DE DÉMONSTRATION
# ============================================================================

echo -e "\n${BLUE}4. CRÉATION DES DONNÉES DE DÉMONSTRATION${NC}"

SEED_FILE="supabase/seed.sql"

cat > "$SEED_FILE" << 'SQL'
-- ============================================================================
-- DONNÉES DE DÉMONSTRATION POUR RIAD DAR AL ANDALUS
-- ============================================================================

-- Configuration de base
INSERT INTO public.configurations (key, value, description, category) VALUES
('site_name', '"Riad Dar Al Andalus"', 'Nom du site', 'general'),
('contact_email', '"contact@riad-al-andalus.com"', 'Email de contact principal', 'contact'),
('contact_phone', '"+212 5 24 38 94 12"', 'Téléphone principal', 'contact'),
('whatsapp_number', '"+212 6 61 23 45 67"', 'Numéro WhatsApp', 'contact'),
('address', '["Derb Sidi Bouloukat", "Médina", "Marrakech 40000", "Maroc"]', 'Adresse complète', 'contact'),
('check_in_time', '"14:00"', 'Heure de check-in', 'reservations'),
('check_out_time', '"12:00"', 'Heure de check-out', 'reservations'),
('currency', '"EUR"', 'Devise principale', 'pricing'),
('tax_rate', '0.1', 'Taux de TVA (10%)', 'pricing'),
('seasonal_multipliers', '{"low": 0.8, "medium": 1.0, "high": 1.3, "peak": 1.5}', 'Multiplicateurs saisonniers', 'pricing')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pages statiques
INSERT INTO public.pages (slug, title, content, meta_title, meta_description, is_published) VALUES
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

-- Chambres
INSERT INTO public.rooms (
    room_number, name, description, category, size_m2, max_capacity,
    base_price_per_night, weekend_surcharge, bed_type,
    has_balcony, has_terrace, has_jacuzzi, view_type,
    amenities, images_urls, featured_image_url, meta_title, meta_description
) VALUES
-- Suite Royale
('S101', 'Suite Royale', 'Suite luxueuse avec salon séparé, jacuzzi et vue panoramique sur la médina. Décoration marocaine authentique avec des matériaux nobles.', 'suite', 55, 3, 280.00, 50.00, 'king',
true, true, true, 'panoramique',
ARRAY['Wi-Fi fibre', 'TV écran plat 55"', 'Mini-bar', 'Coffre-fort', 'Air conditionné', 'Sèche-cheveux', 'Produits de toilette bio', 'Service en chambre 24/24', 'Plateau de bienvenue', 'Jacuzzi privatif'],
ARRAY['/images/chambres/suite-1.jpg', '/images/chambres/suite-2.jpg', '/images/chambres/suite-3.jpg'],
'/images/chambres/suite-featured.jpg',
'Suite Royale - Riad Dar Al Andalus Marrakech',
'Suite luxueuse avec jacuzzi privatif et vue panoramique sur la médina de Marrakech'),

-- Chambre Deluxe
('D201', 'Chambre Deluxe', 'Chambre spacieuse avec terrasse privée offrant une vue sur le jardin intérieur. Décoration élégante alliant modernité et tradition.', 'deluxe', 35, 2, 180.00, 30.00, 'king',
false, true, false, 'jardin',
ARRAY['Wi-Fi haut débit', 'TV écran plat 42"', 'Mini-bar', 'Coffre-fort', 'Air conditionné', 'Sèche-cheveux', 'Produits de toilette bio', 'Terrasse privée', 'Machine à café'],
ARRAY['/images/chambres/deluxe-1.jpg', '/images/chambres/deluxe-2.jpg'],
'/images/chambres/deluxe-featured.jpg',
'Chambre Deluxe - Riad Dar Al Andalus Marrakech',
'Chambre spacieuse avec terrasse privée et vue sur le jardin'),

-- Chambre Standard
('S301', 'Chambre Standard', 'Chambre confortable avec lit double, décorée dans le style traditionnel marocain. Vue sur le patio intérieur.', 'standard', 25, 2, 120.00, 20.00, 'double',
false, false, false, 'patio',
ARRAY['Wi-Fi gratuit', 'TV écran plat 32"', 'Coffre-fort', 'Air conditionné', 'Sèche-cheveux', 'Produits de toilette bio', 'Thé et café'],
ARRAY['/images/chambres/standard-1.jpg', '/images/chambres/standard-2.jpg'],
'/images/chambres/standard-featured.jpg',
'Chambre Standard - Riad Dar Al Andalus Marrakech',
'Chambre confortable avec décoration traditionnelle marocaine'),

-- Suite Familiale
('F102', 'Suite Familiale', 'Suite idéale pour les familles avec deux chambres communicantes et un salon. Espace convivial et fonctionnel.', 'family', 65, 5, 350.00, 60.00, 'twin',
true, true, false, 'jardin',
ARRAY['Wi-Fi fibre', '2 TV écran plat', 'Mini-bar', '2 coffres-forts', 'Air conditionné', 'Sèche-cheveux', 'Produits de toilette bio', 'Terrasse privée', 'Kitchenette', 'Lit bébé sur demande'],
ARRAY['/images/chambres/family-1.jpg', '/images/chambres/family-2.jpg', '/images/chambres/family-3.jpg'],
'/images/chambres/family-featured.jpg',
'Suite Familiale - Riad Dar Al Andalus Marrakech',
'Suite familiale spacieuse avec deux chambres et kitchenette')
ON CONFLICT (room_number) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    size_m2 = EXCLUDED.size_m2,
    max_capacity = EXCLUDED.max_capacity,
    base_price_per_night = EXCLUDED.base_price_per_night,
    weekend_surcharge = EXCLUDED.weekend_surcharge,
    bed_type = EXCLUDED.bed_type,
    has_balcony = EXCLUDED.has_balcony,
    has_terrace = EXCLUDED.has_terrace,
    has_jacuzzi = EXCLUDED.has_jacuzzi,
    view_type = EXCLUDED.view_type,
    amenities = EXCLUDED.amenities,
    images_urls = EXCLUDED.images_urls,
    featured_image_url = EXCLUDED.featured_image_url,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();

-- Services
INSERT INTO public.services (name, description, category, base_price, price_unit, is_included_in_room, duration_minutes, max_participants, image_url, is_active, display_order) VALUES
-- Restauration
('Petit-déjeuner Marocain', 'Buffet complet avec produits frais locaux : pains traditionnels, confitures maison, fruits frais, œufs, fromages, et spécialités marocaines.', 'restauration', 18.00, 'per_person', false, NULL, NULL, '/images/services/breakfast.jpg', true, 1),
('Dîner aux Chandelles', 'Dîner romantique avec spécialités marocaines préparées par notre chef. Menu dégustation de 5 plats.', 'restauration', 45.00, 'per_person', false, 120, 20, '/images/services/dinner.jpg', true, 2),
('Cours de Cuisine Marocaine', 'Apprenez les secrets de la cuisine marocaine avec notre chef. Inclut la préparation d''un tajine et d''une pastilla.', 'restauration', 65.00, 'per_person', false, 180, 8, '/images/services/cooking.jpg', true, 3),

-- Spa
('Hammam Traditionnel', 'Rituel de purification complet avec gommage au savon noir et massage au ghassoul.', 'spa', 45.00, 'per_session', false, 60, 1, '/images/services/hammam.jpg', true, 4),
('Massage Relaxant', 'Massage aux huiles essentielles pour une détente profonde.', 'spa', 75.00, 'per_hour', false, 60, 1, '/images/services/massage.jpg', true, 5),
('Soin du Visage', 'Soin revitalisant aux produits naturels marocains (argile, eau de rose, huile d''argan).', 'spa', 55.00, 'per_session', false, 45, 1, '/images/services/facial.jpg', true, 6),

-- Transport
('Transfert Aéroport', 'Service privé avec chauffeur francophone depuis l''aéroport de Marrakech.', 'transport', 25.00, 'per_trip', false, NULL, 4, '/images/services/transfer.jpg', true, 7),
('Excursion dans l''Atlas', 'Journée complète avec guide, déjeuner berbère et visite des villages traditionnels.', 'activite', 85.00, 'per_person', false, 480, 8, '/images/services/atlas.jpg', true, 8),
('Visite Guidée de la Médina', 'Découverte des souks, monuments historiques et secrets de la médina avec guide certifié.', 'activite', 45.00, 'per_person', false, 180, 10, '/images/services/guided-tour.jpg', true, 9),

-- Sur mesure
('Organisation d''Événements', 'Mariages, anniversaires, séminaires dans un cadre exceptionnel. Sur devis.', 'sur_mesure', 0.00, 'custom', false, NULL, NULL, '/images/services/events.jpg', true, 10),
('Séance Photo Professionnelle', 'Photographe professionnel pour immortaliser votre séjour au riad.', 'sur_mesure', 150.00, 'per_session', false, 120, 10, '/images/services/photoshoot.jpg', true, 11)
ON CONFLICT DO NOTHING;

-- Galerie
INSERT INTO public.gallery (title, description, category, image_url, thumbnail_url, alt_text, is_featured, display_order, is_published) VALUES
('Patio avec Fontaine', 'Notre magnifique patio central avec fontaine traditionnelle en zellige.', 'architecture', '/images/gallery/patio-1.jpg', '/images/gallery/patio-1-thumb.jpg', 'Patio du riad avec fontaine marocaine', true, 1, true),
('Suite Royale - Chambre', 'La chambre principale de notre suite royale avec lit king size.', 'chambres', '/images/gallery/suite-bedroom.jpg', '/images/gallery/suite-bedroom-thumb.jpg', 'Suite royale chambre lit king size', true, 2, true),
('Restaurant aux Chandelles', 'Notre restaurant décoré pour un dîner romantique aux chandelles.', 'restaurant', '/images/gallery/restaurant.jpg', '/images/gallery/restaurant-thumb.jpg', 'Restaurant aux chandelles riad', false, 3, true),
('Jardin & Piscine', 'Notre oasis de tranquillité avec piscine et végétation luxuriante.', 'jardin', '/images/gallery/pool.jpg', '/images/gallery/pool-thumb.jpg', 'Piscine du riad jardin marocain', true, 4, true),
('Spa Hammam', 'Notre hammam traditionnel avec salle de relaxation.', 'spa', '/images/gallery/hammam.jpg', '/images/gallery/hammam-thumb.jpg', 'Hammam traditionnel marocain', false, 5, true),
('Terrasse Panoramique', 'Vue sur les toits de la médina depuis notre terrasse.', 'architecture', '/images/gallery/terrace.jpg', '/images/gallery/terrace-thumb.jpg', 'Terrasse vue médina Marrakech', false, 6, true),
('Cours de Cuisine', 'Atelier de cuisine avec notre chef dans notre cuisine traditionnelle.', 'evenement', '/images/gallery/cooking-class.jpg', '/images/gallery/cooking-class-thumb.jpg', 'Cours de cuisine marocaine', false, 7, true),
('Détails d''Architecture', 'Détails des zelliges et plâtres sculptés traditionnels.', 'architecture', '/images/gallery/details.jpg', '/images/gallery/details-thumb.jpg', 'Détails architecture marocaine', false, 8, true)
ON CONFLICT DO NOTHING;

-- Réductions
INSERT INTO public.discounts (code, name, description, discount_type, value, applies_to, min_stay_nights, valid_from, valid_until, usage_limit, is_active, is_public) VALUES
('RIAD10', 'Réduction de Bienvenue', '10% de réduction sur votre premier séjour', 'percentage', 10.00, 'all', 1, '2024-01-01', '2024-12-31', 1000, true, true),
('LONGSTAY', 'Séjour Long', '15% de réduction pour les séjours de 7 nuits ou plus', 'percentage', 15.00, 'room_only', 7, '2024-01-01', '2024-12-31', NULL, true, true),
('EARLYBIRD', 'Réservation Anticipée', 'Réduction pour réservation 60 jours à l''avance', 'percentage', 12.00, 'all', 2, '2024-01-01', '2024-12-31', NULL, true, true),
('LASTMINUTE', 'Last Minute', '20% de réduction pour réservation moins de 7 jours avant', 'percentage', 20.00, 'room_only', 2, '2024-01-01', '2024-12-31', NULL, true, true),
('HONEYMOON', 'Lune de Miel', 'Forfait spécial lune de miel avec champagne', 'fixed', 50.00, 'all', 3, '2024-01-01', '2024-12-31', 100, true, false)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    value = EXCLUDED.value,
    applies_to = EXCLUDED.applies_to,
    min_stay_nights = EXCLUDED.min_stay_nights,
    valid_from = EXCLUDED.valid_from,
    valid_until = EXCLUDED.valid_until,
    usage_limit = EXCLUDED.usage_limit,
    is_active = EXCLUDED.is_active,
    is_public = EXCLUDED.is_public,
    created_at = NOW();

-- Avis clients (exemples)
INSERT INTO public.reviews (booking_id, profile_id, room_rating, service_rating, cleanliness_rating, location_rating, value_rating, title, comment, is_verified, is_featured, is_published) VALUES
(NULL, NULL, 5, 5, 5, 5, 5, 'Un havre de paix exceptionnel', 'Notre séjour au Riad Dar Al Andalus a été magique. L''accueil est chaleureux, les chambres spacieuses et le petit-déjeuner sur la terrasse était un réveil de rêve. Nous reviendrons !', true, true, true),
(NULL, NULL, 5, 4, 5, 5, 4, 'Expérience authentique', 'Le riad est encore plus beau qu''en photo. L''équipe a tout fait pour rendre notre voyage de noces inoubliable. Les dîners aux chandelles étaient excellents.', true, true, true),
(NULL, NULL, 4, 5, 5, 5, 5, 'Service exceptionnel', 'Excellent rapport qualité-prix. L''emplacement est idéal pour explorer la médina. Le hammam était incroyable après une journée de visite.', true, false, true),
(NULL, NULL, 5, 5, 5, 5, 5, 'Oasis de paix', 'Une oasis de paix au cœur de Marrakech. Le jardin et la piscine sont magnifiques. Le personnel est aux petits soins. Une expérience authentique.', true, true, true)
ON CONFLICT DO NOTHING;

-- Disponibilités pour les 30 prochains jours
INSERT INTO public.availability (room_id, date, price, is_available)
SELECT 
    r.id,
    d.date,
    CASE 
        WHEN EXTRACT(DOW FROM d.date) IN (0, 6) THEN r.base_price_per_night + r.weekend_surcharge
        ELSE r.base_price_per_night
    END as price,
    true as is_available
FROM public.rooms r
CROSS JOIN generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    INTERVAL '1 day'
) d(date)
ON CONFLICT (room_id, date) DO UPDATE SET 
    price = EXCLUDED.price,
    is_available = EXCLUDED.is_available;
SQL

echo -e "${GREEN}✅ Données de démonstration créées: ${SEED_FILE}${NC}"

# ============================================================================
# 5. CRÉATION DES FICHIERS DE CONFIGURATION
# ============================================================================

echo -e "\n${BLUE}5. CRÉATION DES FICHIERS DE CONFIGURATION${NC}"

# Fichier .env.local pour Next.js
cat > .env.local.example << 'ENV'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

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
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# API Keys (optionnel)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
ENV

# Créer les types TypeScript pour Supabase
mkdir -p src/lib/supabase

cat > src/lib/supabase/types.ts << 'TS'
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          room_number: string
          name: string
          description: string | null
          category: Database["public"]["Enums"]["room_category"]
          size_m2: number
          max_capacity: number
          base_price_per_night: number
          weekend_surcharge: number | null
          seasonal_multiplier: number | null
          bed_type: Database["public"]["Enums"]["bed_type"]
          has_balcony: boolean | null
          has_terrace: boolean | null
          has_jacuzzi: boolean | null
          has_kitchenette: boolean | null
          view_type: string | null
          amenities: string[] | null
          images_urls: string[] | null
          featured_image_url: string | null
          status: Database["public"]["Enums"]["room_status"]
          cleaning_schedule: Json | null
          total_bookings: number | null
          average_rating: number | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_number: string
          name: string
          description?: string | null
          category: Database["public"]["Enums"]["room_category"]
          size_m2: number
          max_capacity: number
          base_price_per_night: number
          weekend_surcharge?: number | null
          seasonal_multiplier?: number | null
          bed_type: Database["public"]["Enums"]["bed_type"]
          has_balcony?: boolean | null
          has_terrace?: boolean | null
          has_jacuzzi?: boolean | null
          has_kitchenette?: boolean | null
          view_type?: string | null
          amenities?: string[] | null
          images_urls?: string[] | null
          featured_image_url?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          cleaning_schedule?: Json | null
          total_bookings?: number | null
          average_rating?: number | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_number?: string
          name?: string
          description?: string | null
          category?: Database["public"]["Enums"]["room_category"]
          size_m2?: number
          max_capacity?: number
          base_price_per_night?: number
          weekend_surcharge?: number | null
          seasonal_multiplier?: number | null
          bed_type?: Database["public"]["Enums"]["bed_type"]
          has_balcony?: boolean | null
          has_terrace?: boolean | null
          has_jacuzzi?: boolean | null
          has_kitchenette?: boolean | null
          view_type?: string | null
          amenities?: string[] | null
          images_urls?: string[] | null
          featured_image_url?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          cleaning_schedule?: Json | null
          total_bookings?: number | null
          average_rating?: number | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          booking_reference: string
          profile_id: string | null
          guest_first_name: string
          guest_last_name: string
          guest_email: string
          guest_phone: string
          guest_special_requests: string | null
          check_in_date: string
          check_out_date: string
          nights: number
          room_id: string | null
          room_number: string | null
          room_category: Database["public"]["Enums"]["room_category"] | null
          adults_count: number | null
          children_count: number | null
          children_ages: number[] | null
          base_price: number
          extra_services_price: number | null
          taxes_amount: number | null
          discount_amount: number | null
          total_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          amount_paid: number | null
          amount_due: number
          status: Database["public"]["Enums"]["booking_status"]
          source: string | null
          notes: string | null
          cancellation_reason: string | null
          confirmed_at: string | null
          cancelled_at: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_reference?: string
          profile_id?: string | null
          guest_first_name: string
          guest_last_name: string
          guest_email: string
          guest_phone: string
          guest_special_requests?: string | null
          check_in_date: string
          check_out_date: string
          room_id?: string | null
          room_number?: string | null
          room_category?: Database["public"]["Enums"]["room_category"] | null
          adults_count?: number | null
          children_count?: number | null
          children_ages?: number[] | null
          base_price: number
          extra_services_price?: number | null
          taxes_amount?: number | null
          discount_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          amount_paid?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          source?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          confirmed_at?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_reference?: string
          profile_id?: string | null
          guest_first_name?: string
          guest_last_name?: string
          guest_email?: string
          guest_phone?: string
          guest_special_requests?: string | null
          check_in_date?: string
          check_out_date?: string
          room_id?: string | null
          room_number?: string | null
          room_category?: Database["public"]["Enums"]["room_category"] | null
          adults_count?: number | null
          children_count?: number | null
          children_ages?: number[] | null
          base_price?: number
          extra_services_price?: number | null
          taxes_amount?: number | null
          discount_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          amount_paid?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          source?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          confirmed_at?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          category: Database["public"]["Enums"]["service_category"]
          base_price: number
          price_unit: string | null
          is_included_in_room: boolean | null
          frequency: Database["public"]["Enums"]["service_frequency"] | null
          duration_minutes: number | null
          max_participants: number | null
          image_url: string | null
          details: Json | null
          is_active: boolean | null
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: Database["public"]["Enums"]["service_category"]
          base_price: number
          price_unit?: string | null
          is_included_in_room?: boolean | null
          frequency?: Database["public"]["Enums"]["service_frequency"] | null
          duration_minutes?: number | null
          max_participants?: number | null
          image_url?: string | null
          details?: Json | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          base_price?: number
          price_unit?: string | null
          is_included_in_room?: boolean | null
          frequency?: Database["public"]["Enums"]["service_frequency"] | null
          duration_minutes?: number | null
          max_participants?: number | null
          image_url?: string | null
          details?: Json | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string | null
          profile_id: string | null
          room_rating: number | null
          service_rating: number | null
          cleanliness_rating: number | null
          location_rating: number | null
          value_rating: number | null
          overall_rating: number | null
          title: string | null
          comment: string
          response: string | null
          responded_at: string | null
          is_verified: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          profile_id?: string | null
          room_rating?: number | null
          service_rating?: number | null
          cleanliness_rating?: number | null
          location_rating?: number | null
          value_rating?: number | null
          title?: string | null
          comment: string
          response?: string | null
          responded_at?: string | null
          is_verified?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          profile_id?: string | null
          room_rating?: number | null
          service_rating?: number | null
          cleanliness_rating?: number | null
          location_rating?: number | null
          value_rating?: number | null
          title?: string | null
          comment?: string
          response?: string | null
          responded_at?: string | null
          is_verified?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      contact_messages: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          country: string | null
          subject: Database["public"]["Enums"]["contact_subject"]
          message: string
          booking_reference: string | null
          check_in_date: string | null
          check_out_date: string | null
          status: string | null
          assigned_to: string | null
          notes: string | null
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          country?: string | null
          subject: Database["public"]["Enums"]["contact_subject"]
          message: string
          booking_reference?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          status?: string | null
          assigned_to?: string | null
          notes?: string | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          country?: string | null
          subject?: Database["public"]["Enums"]["contact_subject"]
          message?: string
          booking_reference?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          status?: string | null
          assigned_to?: string | null
          notes?: string | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      availability: {
        Row: {
          id: string
          room_id: string
          date: string
          price: number | null
          is_available: boolean | null
          block_reason: string | null
        }
        Insert: {
          id?: string
          room_id: string
          date: string
          price?: number | null
          is_available?: boolean | null
          block_reason?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          date?: string
          price?: number | null
          is_available?: boolean | null
          block_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      discounts: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          value: number
          applies_to: Database["public"]["Enums"]["discount_applies_to"] | null
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
          id?: string
          code: string
          name: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          value: number
          applies_to?: Database["public"]["Enums"]["discount_applies_to"] | null
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
          id?: string
          code?: string
          name?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          value?: number
          applies_to?: Database["public"]["Enums"]["discount_applies_to"] | null
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
        Relationships: []
      }
      gallery: {
        Row: {
          id: string
          title: string
          description: string | null
          category: Database["public"]["Enums"]["gallery_category"]
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
          id?: string
          title: string
          description?: string | null
          category: Database["public"]["Enums"]["gallery_category"]
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
          id?: string
          title?: string
          description?: string | null
          category?: Database["public"]["Enums"]["gallery_category"]
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
        Relationships: []
      }
      pages: {
        Row: {
          id: string
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
          id?: string
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
          id?: string
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      available_rooms: {
        Row: {
          id: string | null
          room_number: string | null
          name: string | null
          description: string | null
          category: Database["public"]["Enums"]["room_category"] | null
          size_m2: number | null
          max_capacity: number | null
          base_price_per_night: number | null
          weekend_surcharge: number | null
          seasonal_multiplier: number | null
          bed_type: Database["public"]["Enums"]["bed_type"] | null
          has_balcony: boolean | null
          has_terrace: boolean | null
          has_jacuzzi: boolean | null
          has_kitchenette: boolean | null
          view_type: string | null
          amenities: string[] | null
          images_urls: string[] | null
          featured_image_url: string | null
          status: Database["public"]["Enums"]["room_status"] | null
          cleaning_schedule: Json | null
          total_bookings: number | null
          average_rating: number | null
          meta_title: string | null
          meta_description: string | null
          created_at: string | null
          updated_at: string | null
          date: string | null
          daily_price: number | null
          is_available: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_room_id_fkey"
            columns: ["id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      check_room_availability: {
        Args: {
          p_room_id: string
          p_check_in: string
          p_check_out: string
        }
        Returns: boolean
      }
      calculate_booking_price: {
        Args: {
          p_room_id: string
          p_check_in: string
          p_check_out: string
          p_adults_count: number
          p_children_count: number
        }
        Returns: number
      }
    }
    Enums: {
      room_category: "standard" | "deluxe" | "suite" | "family" | "presidentielle"
      bed_type: "simple" | "double" | "king" | "queen" | "twin"
      room_status: "available" | "occupied" | "maintenance" | "cleaning" | "reserved"
      booking_status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show"
      payment_status: "pending" | "partial" | "paid" | "refunded" | "failed"
      service_category: "restauration" | "spa" | "transport" | "activite" | "sur_mesure"
      service_frequency: "unique" | "quotidien" | "hebdomadaire"
      contact_subject: "reservation" | "information" | "service" | "reclamation" | "partenariat" | "autre"
      discount_type: "percentage" | "fixed" | "nights"
      discount_applies_to: "all" | "room_only" | "services_only"
      gallery_category: "chambres" | "restaurant" | "spa" | "jardin" | "piscine" | "evenement" | "architecture"
    }
  }
}
TS

# Créer le client Supabase
cat > src/lib/supabase/client.ts << 'TS'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
TS

cat > src/lib/supabase/server.ts << 'TS'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
TS

# Créer un fichier de services pour Supabase
cat > src/lib/supabase/services.ts << 'TS'
import { createClient } from './client'

// Service pour les chambres
export const roomService = {
  async getAvailableRooms(checkIn: Date, checkOut: Date, guests: number = 2) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('available_rooms')
      .select('*')
      .gte('date', checkIn.toISOString().split('T')[0])
      .lt('date', checkOut.toISOString().split('T')[0])
      .eq('is_available', true)
      .gte('max_capacity', guests)
    
    if (error) throw error
    return data
  },
  
  async getRoomDetails(roomId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    
    if (error) throw error
    return data
  },
  
  async getAllRooms() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available')
      .order('base_price_per_night')
    
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
  },
  
  async checkAvailability(roomId: string, checkIn: Date, checkOut: Date) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .rpc('check_room_availability', {
        p_room_id: roomId,
        p_check_in: checkIn.toISOString().split('T')[0],
        p_check_out: checkOut.toISOString().split('T')[0]
      })
    
    if (error) throw error
    return data
  },
  
  async calculatePrice(roomId: string, checkIn: Date, checkOut: Date, adults: number, children: number) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .rpc('calculate_booking_price', {
        p_room_id: roomId,
        p_check_in: checkIn.toISOString().split('T')[0],
        p_check_out: checkOut.toISOString().split('T')[0],
        p_adults_count: adults,
        p_children_count: children
      })
    
    if (error) throw error
    return data
  }
}

// Service pour les contacts
export const contactService = {
  async sendMessage(messageData: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    subject: string
    message: string
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        ...messageData,
        status: 'new'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Service pour les avis
export const reviewService = {
  async getPublishedReviews(limit: number = 10) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },
  
  async getFeaturedReviews() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    return data
  },
  
  async createReview(reviewData: {
    booking_id?: string
    room_rating: number
    service_rating: number
    cleanliness_rating: number
    location_rating: number
    value_rating: number
    comment: string
    title?: string
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...reviewData,
        is_published: false,
        is_verified: false
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Service pour les services additionnels
export const serviceService = {
  async getActiveServices() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    if (error) throw error
    return data
  },
  
  async getServicesByCategory(category: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('display_order')
    
    if (error) throw error
    return data
  }
}

// Service pour la galerie
export const galleryService = {
  async getGalleryImages(category?: string) {
    const supabase = createClient()
    
    let query = supabase
      .from('gallery')
      .select('*')
      .eq('is_published', true)
      .order('display_order')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },
  
  async getFeaturedImages() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('display_order')
      .limit(8)
    
    if (error) throw error
    return data
  }
}

// Service pour les réductions
export const discountService = {
  async validateDiscountCode(code: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .single()
    
    if (error) return null
    return data
  }
}

// Service pour les configurations
export const configService = {
  async getConfig(key: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('configurations')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error) return null
    return data?.value
  },
  
  async getSiteConfig() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .in('key', [
        'site_name',
        'contact_email',
        'contact_phone',
        'whatsapp_number',
        'address',
        'check_in_time',
        'check_out_time',
        'currency'
      ])
    
    if (error) return {}
    
    const config: Record<string, any> = {}
    data.forEach(item => {
      config[item.key] = item.value
    })
    
    return config
  }
}
TS

echo -e "${GREEN}✅ Fichiers de configuration créés${NC}"

# ============================================================================
# 6. INSTALLATION DES DÉPENDANCES
# ============================================================================

echo -e "\n${BLUE}6. INSTALLATION DES DÉPENDANCES${NC}"

# Installer les packages nécessaires pour Supabase
echo -e "${YELLOW}📦 Installation des packages Supabase...${NC}"

# Vérifier si package.json existe
if [ -f "package.json" ]; then
    # Installer @supabase/supabase-js et @supabase/ssr
    npm install @supabase/supabase-js @supabase/ssr
    
    # Ajouter les scripts au package.json
    if ! grep -q '"supabase"' package.json; then
        npm pkg set scripts.supabase:start="supabase start"
        npm pkg set scripts.supabase:stop="supabase stop"
        npm pkg set scripts.supabase:reset="supabase db reset"
        npm pkg set scripts.supabase:status="supabase status"
        npm pkg set scripts.supabase:studio="supabase studio"
    fi
    
    echo -e "${GREEN}✅ Packages Supabase installés${NC}"
else
    echo -e "${YELLOW}⚠️  package.json non trouvé, création...${NC}"
    
    cat > package.json << 'JSON'
{
  "name": "riad-dar-al-andalus",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:status": "supabase status",
    "supabase:studio": "supabase studio"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "@supabase/ssr": "^0.1.0",
    "next": "15.0.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
JSON
    
    # Installer les dépendances
    npm install @supabase/supabase-js @supabase/ssr
fi

# ============================================================================
# 7. LANCER SUPABASE EN LOCAL
# ============================================================================

echo -e "\n${BLUE}7. LANCEMENT DE SUPABASE EN LOCAL${NC}"

read -p "Voulez-vous lancer Supabase en local maintenant ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚀 Lancement de Supabase...${NC}"
    
    # Démarrer Supabase
    supabase start
    
    # Appliquer les migrations
    echo -e "${YELLOW}📝 Application des migrations...${NC}"
    supabase db reset
    
    # Ouvrir le studio
    echo -e "${YELLOW}🖥️  Ouverture du Studio Supabase...${NC}"
    echo -e "${GREEN}✅ Studio disponible à: http://localhost:54323${NC}"
    
    # Démarrer l'application Next.js (si package.json existe)
    if [ -f "package.json" ]; then
        echo -e "\n${YELLOW}🎯 Pour démarrer l'application Next.js:${NC}"
        echo -e "${GREEN}   npm run dev${NC}"
        echo -e "\n${YELLOW}🌐 Votre application sera disponible à:${NC}"
        echo -e "${GREEN}   http://localhost:3000${NC}"
    fi
fi

# ============================================================================
# 8. GUIDE D'UTILISATION
# ============================================================================

echo -e "\n${GREEN}"
echo "============================================================================"
echo "✅ CONFIGURATION SUPABASE TERMINÉE AVEC SUCCÈS !"
echo "============================================================================"
echo -e "${NC}"

echo -e "${BLUE}📊 RÉCAPITULATIF DE LA CONFIGURATION :${NC}"
echo ""
echo "📁 Structure créée :"
echo "   ├── supabase/migrations/    # Schéma SQL complet"
echo "   ├── supabase/seed.sql       # Données de démonstration"
echo "   ├── src/lib/supabase/       # Client et services"
echo "   │   ├── types.ts            # Types TypeScript"
echo "   │   ├── client.ts           # Client navigateur"
echo "   │   ├── server.ts           # Client serveur"
echo "   │   └── services.ts         # Services réutilisables"
echo "   └── .env.local.example      # Variables d'environnement"
echo ""
echo "🗃️  Tables créées :"
echo "   ✓ profiles          # Profils utilisateurs"
echo "   ✓ rooms             # Chambres et suites (4 types)"
echo "   ✓ bookings          # Système de réservation"
echo "   ✓ services          # 11 services additionnels"
echo "   ✓ reviews           # Avis clients"
echo "   ✓ contact_messages  # Formulaire de contact"
echo "   ✓ availability      # Gestion des disponibilités"
echo "   ✓ gallery           # Galerie photos (8 images)"
echo "   ✓ discounts         # Codes promotionnels (5 codes)"
echo "   ✓ pages             # Pages statiques"
echo "   ✓ configurations    # Configuration du site"
echo ""
echo "🚀 Fonctionnalités implémentées :"
echo "   ✓ Réservation en ligne"
echo "   ✓ Calcul de prix automatique"
echo "   ✓ Vérification de disponibilité"
echo "   ✓ Gestion des services additionnels"
echo "   ✓ Système d'avis et notations"
echo "   ✓ Formulaire de contact"
echo "   ✓ Galerie photos"
echo "   ✅ Codes promotionnels"
echo ""
echo "🔧 Commandes disponibles :"
echo "   ${YELLOW}npm run supabase:start${NC}    # Démarrer Supabase en local"
echo "   ${YELLOW}npm run supabase:stop${NC}     # Arrêter Supabase"
echo "   ${YELLOW}npm run supabase:reset${NC}    # Réinitialiser la base de données"
echo "   ${YELLOW}npm run supabase:studio${NC}   # Ouvrir l'interface d'administration"
echo "   ${YELLOW}npm run dev${NC}               # Démarrer Next.js"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1. ${YELLOW}Créez un compte sur supabase.com (gratuit)${NC}"
echo "2. ${YELLOW}Créez un nouveau projet${NC}"
echo "3. ${YELLOW}Récupérez vos clés d'API :${NC}"
echo "   - URL du projet"
echo "   - Clé anon"
echo "   - Clé service role (secrète)"
echo "4. ${YELLOW}Copiez .env.local.example vers .env.local${NC}"
echo "5. ${YELLOW}Remplissez vos clés d'API dans .env.local${NC}"
echo "6. ${YELLOW}Pour déployer en production :${NC}"
echo "   supabase link --project-ref votre-project-id"
echo "   supabase db push"
echo ""
echo "🔗 URLs importantes :"
echo "   📍 Studio Supabase : ${GREEN}http://localhost:54323${NC}"
echo "   🌐 Votre site : ${GREEN}http://localhost:3000${NC}"
echo "   📚 Documentation : ${GREEN}https://supabase.com/docs${NC}"
echo ""
echo "💡 Exemples d'utilisation :"
echo ""
echo "// Récupérer les chambres disponibles"
echo "const rooms = await roomService.getAvailableRooms(checkIn, checkOut, 2);"
echo ""
echo "// Créer une réservation"
echo "const booking = await bookingService.createBooking({"
echo "  guest_first_name: 'Jean',"
echo "  guest_last_name: 'Dupont',"
echo "  guest_email: 'jean@example.com',"
echo "  guest_phone: '+33123456789',"
echo "  check_in_date: '2024-12-25',"
echo "  check_out_date: '2024-12-30',"
echo "  room_id: 'chambre-id',"
echo "  adults_count: 2"
echo "});"
echo ""
echo "// Envoyer un message de contact"
echo "await contactService.sendMessage({"
echo "  first_name: 'Marie',"
echo "  last_name: 'Martin',"
echo "  email: 'marie@example.com',"
echo "  subject: 'reservation',"
echo "  message: 'Bonjour, je souhaite réserver...'"
echo "});"
echo ""
echo -e "${GREEN}✨ Votre backend Supabase est prêt !${NC}"
echo -e "${YELLOW}🎯 Connectez-le à votre frontend Next.js existant pour un site complet.${NC}"