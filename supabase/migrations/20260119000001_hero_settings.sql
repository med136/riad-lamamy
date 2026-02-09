-- Table pour les paramètres de la section Hero
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Bienvenue au Riad Dar Al Andalus',
  subtitle TEXT NOT NULL DEFAULT 'Une oasis de paix au cœur de la médina',
  background_image TEXT,
  cta_primary_text VARCHAR(100) DEFAULT 'Réserver maintenant',
  cta_primary_link VARCHAR(200) DEFAULT '/reservations',
  cta_secondary_text VARCHAR(100) DEFAULT 'Découvrir nos chambres',
  cta_secondary_link VARCHAR(200) DEFAULT '/chambres',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les valeurs par défaut
INSERT INTO public.hero_settings (title, subtitle, background_image)
VALUES (
  'Bienvenue au Riad Dar Al Andalus',
  'Une oasis de paix au cœur de la médina',
  '/images/hero/hero-1.jpg'
) ON CONFLICT (id) DO NOTHING;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_hero_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_settings_updated_at
  BEFORE UPDATE ON public.hero_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_settings_updated_at();
