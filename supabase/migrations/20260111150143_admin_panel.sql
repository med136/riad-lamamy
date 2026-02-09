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

