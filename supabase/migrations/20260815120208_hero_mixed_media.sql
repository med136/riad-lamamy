ALTER TABLE public.hero_carousel_images
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS poster_url TEXT,
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.hero_carousel_images
SET media_url = image_url
WHERE media_url IS NULL;

ALTER TABLE public.hero_carousel_images
  ALTER COLUMN media_url SET NOT NULL;

ALTER TABLE public.hero_carousel_images
  DROP CONSTRAINT IF EXISTS hero_carousel_images_media_type_check;

ALTER TABLE public.hero_carousel_images
  ADD CONSTRAINT hero_carousel_images_media_type_check
  CHECK (media_type IN ('image', 'video'));

CREATE INDEX IF NOT EXISTS idx_hero_carousel_media_active_order
  ON public.hero_carousel_images (hero_settings_id, display_order)
  WHERE is_active = TRUE;

ALTER TABLE public.hero_carousel_images ENABLE ROW LEVEL SECURITY;

COMMENT ON COLUMN public.hero_carousel_images.image_url IS
  'Legacy compatibility column. New code uses media_url.';
