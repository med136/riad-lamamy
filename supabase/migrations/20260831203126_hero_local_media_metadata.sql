ALTER TABLE public.hero_settings
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.hero_carousel_images
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT;

ALTER TABLE public.hero_carousel_images
  DROP CONSTRAINT IF EXISTS hero_carousel_images_file_size_check;

ALTER TABLE public.hero_carousel_images
  ADD CONSTRAINT hero_carousel_images_file_size_check
  CHECK (file_size IS NULL OR (file_size > 0 AND file_size <= 52428800));

COMMENT ON COLUMN public.hero_carousel_images.file_name IS
  'Server-generated filename for locally hosted Hero media.';
COMMENT ON COLUMN public.hero_carousel_images.mime_type IS
  'Validated MIME type captured at upload time.';
COMMENT ON COLUMN public.hero_carousel_images.file_size IS
  'Validated media size in bytes captured at upload time.';
