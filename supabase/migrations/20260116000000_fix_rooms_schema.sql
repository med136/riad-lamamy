-- ============================================================================
-- MIGRATION POUR CORRIGER LA TABLE ROOMS - AJOUTER LES COLONNES MANQUANTES
-- ============================================================================

-- Ajouter la colonne 'featured' si elle n'existe pas
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Ajouter la colonne 'slug' si elle n'existe pas
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Ajouter la colonne 'base_price' si elle n'existe pas
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);

-- Ajouter la colonne 'order_index' si elle n'existe pas
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Si la colonne base_price est NULL et base_price_per_night existe, copier les valeurs
UPDATE public.rooms
SET base_price = base_price_per_night
WHERE base_price IS NULL AND base_price_per_night IS NOT NULL;

-- Créer les slugs si la colonne est vide
UPDATE public.rooms
SET slug = (
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[àáâãäå]', 'a', 'g'),
        '[èéêë]', 'e', 'g'
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  )
)
WHERE slug IS NULL OR slug = '';

-- Créer un index sur le slug pour les recherches rapides
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_slug ON public.rooms(slug);

-- Créer un index sur featured pour les filtres
CREATE INDEX IF NOT EXISTS idx_rooms_featured ON public.rooms(featured);

-- Créer un index sur status
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
