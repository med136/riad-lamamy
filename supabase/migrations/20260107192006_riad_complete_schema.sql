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
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_category') THEN
  CREATE TYPE room_category AS ENUM ('standard', 'deluxe', 'suite', 'family', 'presidentielle');
END IF; END $$; 
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bed_type') THEN
  CREATE TYPE bed_type AS ENUM ('simple', 'double', 'king', 'queen', 'twin');
END IF; END $$; 
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
  CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'cleaning', 'reserved');
END IF; END $$; 
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
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
END IF; END $$; 
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
  CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'failed');
END IF; END $$; 
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
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_category') THEN
  CREATE TYPE service_category AS ENUM ('restauration', 'spa', 'transport', 'activite', 'sur_mesure');
END IF; END $$; 
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_frequency') THEN
  CREATE TYPE service_frequency AS ENUM ('unique', 'quotidien', 'hebdomadaire');
END IF; END $$; 
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
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_subject') THEN
  CREATE TYPE contact_subject AS ENUM ('reservation', 'information', 'service', 'reclamation', 'partenariat', 'autre');
END IF; END $$; 
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
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'nights');
END IF; END $$; 
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_applies_to') THEN
  CREATE TYPE discount_applies_to AS ENUM ('all', 'room_only', 'services_only');
END IF; END $$; 
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
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_category') THEN
  CREATE TYPE gallery_category AS ENUM ('chambres', 'restaurant', 'spa', 'jardin', 'piscine', 'evenement', 'architecture');
END IF; END $$; 
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
