-- Table pour les images du carrousel de la section Hero
CREATE TABLE IF NOT EXISTS public.hero_carousel_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_settings_id UUID NOT NULL REFERENCES public.hero_settings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_hero_carousel_images_hero_settings_id ON public.hero_carousel_images(hero_settings_id);
CREATE INDEX idx_hero_carousel_images_display_order ON public.hero_carousel_images(display_order);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_hero_carousel_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_carousel_images_updated_at
  BEFORE UPDATE ON public.hero_carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_carousel_images_updated_at();
