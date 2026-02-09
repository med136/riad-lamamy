-- ============================================================================
-- MISE À JOUR COMPLÈTE POUR RIAD DAR AL ANDALUS (CORRIGÉ)
-- ============================================================================

-- 1. Activer l'extension uuid-ossp dans le schéma public
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- 2. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can create profiles" ON public.profiles;
CREATE POLICY "Public can create profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Vérifier et compléter la table rooms existante
DO $$ 
BEGIN
    -- Si la table rooms existe déjà (de votre script précédent)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms' AND table_schema = 'public') THEN
        -- Ajouter room_number si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'room_number' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN room_number VARCHAR(10) UNIQUE;
        END IF;
        
        -- Ajouter bed_type si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'bed_type' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN bed_type VARCHAR(20) DEFAULT 'double';
        END IF;
        
        -- Ajouter has_balcony si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'has_balcony' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN has_balcony BOOLEAN DEFAULT false;
        END IF;
        
        -- Ajouter has_terrace si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'has_terrace' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN has_terrace BOOLEAN DEFAULT false;
        END IF;
        
        -- Ajouter has_jacuzzi si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'has_jacuzzi' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN has_jacuzzi BOOLEAN DEFAULT false;
        END IF;
        
        -- Ajouter featured_image_url si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'featured_image_url' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN featured_image_url TEXT;
        END IF;
        
        -- Ajouter updated_at si n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'rooms' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE public.rooms ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        END IF;
    ELSE
        -- Créer la table rooms si elle n'existe pas
        CREATE TABLE public.rooms (
            id BIGSERIAL PRIMARY KEY,
            room_number VARCHAR(10) UNIQUE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(20) CHECK (category IN ('standard', 'deluxe', 'suite', 'family')),
            price DECIMAL(10,2) NOT NULL,
            size_m2 INTEGER,
            capacity INTEGER DEFAULT 2,
            amenities TEXT[] DEFAULT '{}',
            images TEXT[] DEFAULT '{}',
            is_available BOOLEAN DEFAULT TRUE,
            bed_type VARCHAR(20) DEFAULT 'double',
            has_balcony BOOLEAN DEFAULT false,
            has_terrace BOOLEAN DEFAULT false,
            has_jacuzzi BOOLEAN DEFAULT false,
            featured_image_url TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Insérer des chambres par défaut
        INSERT INTO public.rooms (room_number, name, description, category, price, size_m2, capacity, amenities, images) VALUES
        ('S101', 'Chambre Standard', 'Chambre confortable avec lit double et salle de bain privée. Vue sur le patio.', 'standard', 120.00, 25, 2,
         ARRAY['Wi-Fi gratuit', 'Air conditionné', 'TV', 'Salle de bain privée', 'Coffre-fort'],
         ARRAY['/images/rooms/standard-1.jpg', '/images/rooms/standard-2.jpg']),
        
        ('D201', 'Chambre Deluxe', 'Chambre spacieuse avec terrasse privée et vue sur le jardin. Élégance marocaine.', 'deluxe', 180.00, 35, 2,
         ARRAY['Wi-Fi haut débit', 'Air conditionné', 'TV écran plat', 'Terrasse privée', 'Mini-bar', 'Machine à café'],
         ARRAY['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg']),
        
        ('SR301', 'Suite Royale', 'Suite luxueuse avec salon séparé et décoration traditionnelle raffinée.', 'suite', 280.00, 55, 3,
         ARRAY['Wi-Fi fibre', 'TV 55"', 'Jacuzzi', 'Service en chambre', 'Plateau de bienvenue', 'Parking privé'],
         ARRAY['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg', '/images/rooms/suite-3.jpg']),
        
        ('SF401', 'Suite Familiale', 'Idéale pour les familles, avec deux chambres communicantes et espace de vie.', 'family', 350.00, 65, 5,
         ARRAY['Wi-Fi fibre', '2 TV', 'Kitchenette', '2 salles de bain', 'Terrasse', 'Lit bébé sur demande'],
         ARRAY['/images/rooms/family-1.jpg', '/images/rooms/family-2.jpg']);
    END IF;
END $$;

-- Mettre à jour les numéros de chambre s'ils sont vides
UPDATE public.rooms 
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
UPDATE public.rooms 
SET has_terrace = true 
WHERE EXISTS (
    SELECT 1 FROM unnest(amenities) AS amenity 
    WHERE amenity LIKE '%Terrasse%' OR amenity LIKE '%terrace%'
);

UPDATE public.rooms 
SET has_jacuzzi = true 
WHERE EXISTS (
    SELECT 1 FROM unnest(amenities) AS amenity 
    WHERE amenity LIKE '%Jacuzzi%' OR amenity LIKE '%jacuzzi%'
);

-- 4. Vérifier et compléter la table bookings existante
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
        -- Ajouter guest_first_name et guest_last_name
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'guest_first_name' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN guest_first_name VARCHAR(100);
            ALTER TABLE public.bookings ADD COLUMN guest_last_name VARCHAR(100);
            
            -- Remplir avec les données existantes
            UPDATE public.bookings 
            SET guest_first_name = split_part(customer_name, ' ', 1),
                guest_last_name = split_part(customer_name, ' ', 2)
            WHERE guest_first_name IS NULL;
        END IF;
        
        -- Ajouter profile_id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'profile_id' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
        END IF;
        
        -- Ajouter room_id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'room_id' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN room_id BIGINT REFERENCES public.rooms(id) ON DELETE RESTRICT;
        END IF;
        
        -- Ajouter payment_status
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'payment_status' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
        END IF;
        
        -- Ajouter amount_paid
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'amount_paid' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        -- Ajouter updated_at
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        END IF;
        
        -- Ajouter les timestamps d'événements
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'confirmed_at' AND table_schema = 'public') THEN
            ALTER TABLE public.bookings ADD COLUMN confirmed_at TIMESTAMP;
            ALTER TABLE public.bookings ADD COLUMN checked_in_at TIMESTAMP;
            ALTER TABLE public.bookings ADD COLUMN checked_out_at TIMESTAMP;
        END IF;
    ELSE
        -- Créer la table bookings si elle n'existe pas
        CREATE TABLE public.bookings (
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
            guest_first_name VARCHAR(100),
            guest_last_name VARCHAR(100),
            profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            room_id BIGINT REFERENCES public.rooms(id) ON DELETE RESTRICT,
            payment_status VARCHAR(20) DEFAULT 'pending',
            amount_paid DECIMAL(10,2) DEFAULT 0,
            confirmed_at TIMESTAMP,
            checked_in_at TIMESTAMP,
            checked_out_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Créer la séquence pour les codes de réservation
        CREATE SEQUENCE IF NOT EXISTS public.booking_seq START 1;
    END IF;
END $$;

-- 5. Vérifier et compléter la table services existante
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services' AND table_schema = 'public') THEN
        CREATE TABLE public.services (
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
        
        -- Insérer des services par défaut
        INSERT INTO public.services (name, description, price, category, duration_minutes, display_order) VALUES
        ('Petit-déjeuner Marocain', 'Buffet complet avec spécialités locales et produits frais', 18.00, 'restauration', NULL, 1),
        ('Dîner aux Chandelles', 'Menu gastronomique marocain dans une ambiance romantique', 45.00, 'restauration', 120, 2),
        ('Transfert Aéroport', 'Service privé avec chauffeur depuis l''aéroport de Marrakech', 25.00, 'transport', NULL, 3),
        ('Massage Relaxant', 'Session de massage de 60 minutes aux huiles essentielles', 75.00, 'spa', 60, 4),
        ('Visite Guidée Médina', 'Découverte des souks et monuments avec guide certifié', 45.00, 'activité', 180, 5),
        ('Cours de Cuisine', 'Apprentissage des secrets de la cuisine marocaine traditionnelle', 65.00, 'activité', 180, 6);
    END IF;
END $$;

-- 6. Vérifier et compléter la table contact_messages existante
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages' AND table_schema = 'public') THEN
        CREATE TABLE public.contact_messages (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            subject VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );
    END IF;
END $$;

-- 7. Vérifier et compléter la table reviews existante
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        CREATE TABLE public.reviews (
            id BIGSERIAL PRIMARY KEY,
            author_name VARCHAR(100) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            author_country VARCHAR(50),
            is_featured BOOLEAN DEFAULT FALSE,
            is_approved BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Insérer des avis par défaut
        INSERT INTO public.reviews (author_name, rating, comment, author_country, is_featured) VALUES
        ('Sophie Martin', 5, 'Un séjour magique dans un cadre exceptionnel. Le personnel est aux petits soins !', 'France', TRUE),
        ('Thomas Bernard', 4, 'Excellent rapport qualité-prix. La terrasse de la chambre Deluxe est magnifique au coucher du soleil.', 'Belgique', TRUE),
        ('Maria Rodriguez', 5, 'Notre voyage de noces a été parfait. La Suite Royale est somptueuse et le service impeccable.', 'Espagne', TRUE),
        ('Ahmed Khalil', 5, 'Authenticité et modernité. Un vrai havre de paix au cœur de Marrakech.', 'Maroc', FALSE),
        ('Emma Johnson', 5, 'The family suite was perfect for our needs. Kids loved the pool and the staff was wonderful.', 'USA', TRUE);
    END IF;
END $$;

-- 8. Vérifier et compléter la table availability existante
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability' AND table_schema = 'public') THEN
        CREATE TABLE public.availability (
            id BIGSERIAL PRIMARY KEY,
            room_id BIGINT REFERENCES public.rooms(id),
            date DATE NOT NULL,
            price DECIMAL(10,2),
            is_available BOOLEAN DEFAULT TRUE,
            UNIQUE(room_id, date)
        );
    END IF;
END $$;

-- 9. Créer la table des services réservés
CREATE TABLE IF NOT EXISTS public.booking_services (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES public.services(id) ON DELETE RESTRICT,
    
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

-- 10. Créer la table de la galerie
CREATE TABLE IF NOT EXISTS public.gallery (
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

-- 11. Créer la table des réductions
CREATE TABLE IF NOT EXISTS public.discounts (
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

-- 12. Créer la table des configurations
CREATE TABLE IF NOT EXISTS public.configurations (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. Créer la table des pages statiques
CREATE TABLE IF NOT EXISTS public.pages (
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

-- Activer RLS sur toutes les tables (si ce n'est pas déjà fait)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les tables existantes (si non définies)
DO $$ 
BEGIN
    -- Politique pour rooms
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view available rooms' AND tablename = 'rooms') THEN
        CREATE POLICY "Public can view available rooms" ON public.rooms FOR SELECT USING (is_available = TRUE);
    END IF;
    
    -- Politique pour services
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active services' AND tablename = 'services') THEN
        CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (is_active = TRUE);
    END IF;
    
    -- Politique pour reviews
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view approved reviews' AND tablename = 'reviews') THEN
        CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
    END IF;
    
    -- Politique pour bookings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can create bookings' AND tablename = 'bookings') THEN
        CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Politique pour contact_messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can create contact messages' AND tablename = 'contact_messages') THEN
        CREATE POLICY "Public can create contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Politique pour booking_services
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can create booking services' AND tablename = 'booking_services') THEN
        CREATE POLICY "Public can create booking services" ON public.booking_services FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Politique pour gallery
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published gallery' AND tablename = 'gallery') THEN
        CREATE POLICY "Public can view published gallery" ON public.gallery FOR SELECT USING (is_published = true);
    END IF;
    
    -- Politique pour discounts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active discounts' AND tablename = 'discounts') THEN
        CREATE POLICY "Public can view active discounts" ON public.discounts FOR SELECT USING (is_active = true AND is_public = true AND valid_until >= CURRENT_DATE);
    END IF;
    
    -- Politique pour configurations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view configurations' AND tablename = 'configurations') THEN
        CREATE POLICY "Public can view configurations" ON public.configurations FOR SELECT USING (true);
    END IF;
    
    -- Politique pour pages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published pages' AND tablename = 'pages') THEN
        CREATE POLICY "Public can view published pages" ON public.pages FOR SELECT USING (is_published = true);
    END IF;
END $$;

-- 14. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Triggers pour updated_at
DO $$ 
BEGIN
    -- Pour rooms
    DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
    CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    
    -- Pour bookings
    DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
    CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    
    -- Pour configurations
    DROP TRIGGER IF EXISTS update_configurations_updated_at ON public.configurations;
    CREATE TRIGGER update_configurations_updated_at 
    BEFORE UPDATE ON public.configurations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    
    -- Pour pages
    DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
    CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
END $$;

-- 16. Fonction pour vérifier la disponibilité
CREATE OR REPLACE FUNCTION public.check_room_availability(
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
    FROM public.bookings
    WHERE room_id = p_room_id
    AND status NOT IN ('cancelled', 'no_show')
    AND check_in < p_check_out
    AND check_out > p_check_in;
    
    RETURN overlapping_bookings = 0;
END;
$$ language 'plpgsql';

-- 17. Fonction pour calculer le prix
CREATE OR REPLACE FUNCTION public.calculate_booking_price(
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

-- 18. Insérer des données de démonstration

-- Galerie
INSERT INTO public.gallery (title, description, category, image_url, is_featured, display_order, is_published) VALUES
('Patio avec Fontaine', 'Notre magnifique patio central avec fontaine traditionnelle en zellige.', 'architecture', '/images/gallery/patio-1.jpg', true, 1, true),
('Suite Royale - Chambre', 'La chambre principale de notre suite royale avec lit king size.', 'chambres', '/images/gallery/suite-bedroom.jpg', true, 2, true),
('Jardin & Piscine', 'Notre oasis de tranquillité avec piscine et végétation luxuriante.', 'jardin', '/images/gallery/pool.jpg', true, 3, true),
('Restaurant aux Chandelles', 'Notre restaurant décoré pour un dîner romantique aux chandelles.', 'restaurant', '/images/gallery/restaurant.jpg', false, 4, true),
('Spa Hammam', 'Notre hammam traditionnel avec salle de relaxation.', 'spa', '/images/gallery/hammam.jpg', false, 5, true)
ON CONFLICT DO NOTHING;

-- Réductions
INSERT INTO public.discounts (code, name, description, discount_type, value, applies_to, min_stay_nights, valid_from, valid_until, is_active, is_public) VALUES
('RIAD10', 'Réduction de Bienvenue', '10% de réduction sur votre premier séjour', 'percentage', 10.00, 'all', 1, '2024-01-01', '2024-12-31', true, true),
('LONGSTAY', 'Séjour Long', '15% de réduction pour les séjours de 7 nuits ou plus', 'percentage', 15.00, 'room_only', 7, '2024-01-01', '2024-12-31', true, true),
('EARLYBIRD', 'Réservation Anticipée', 'Réduction pour réservation 60 jours à l''avance', 'percentage', 12.00, 'all', 2, '2024-01-01', '2024-12-31', true, true)
ON CONFLICT (code) DO NOTHING;

-- Configurations
INSERT INTO public.configurations (key, value, description, category) VALUES
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

-- 19. Vue pour les chambres disponibles
CREATE OR REPLACE VIEW public.available_rooms AS
SELECT 
    r.*,
    a.date,
    COALESCE(a.price, r.price) as daily_price,
    COALESCE(a.is_available, true) as is_available
FROM public.rooms r
LEFT JOIN public.availability a ON r.id = a.room_id
WHERE r.is_available = true;

-- 20. Ajouter des disponibilités pour les 30 prochains jours
INSERT INTO public.availability (room_id, date, price, is_available)
SELECT 
    r.id,
    d.date,
    r.price,
    true
FROM public.rooms r
CROSS JOIN generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    INTERVAL '1 day'
) d(date)
ON CONFLICT (room_id, date) DO NOTHING;

-- ============================================================================
-- FIN DU SCRIPT SQL
-- ============================================================================