-- Ajouter la colonne display_mode à hero_settings
ALTER TABLE public.hero_settings
ADD COLUMN IF NOT EXISTS display_mode VARCHAR(20) DEFAULT 'carousel';

-- display_mode peut être: 'carousel' ou 'static'
