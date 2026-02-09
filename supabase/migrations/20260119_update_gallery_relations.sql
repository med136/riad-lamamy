-- Ajouter les colonnes de relations à la table gallery
ALTER TABLE public.gallery
ADD COLUMN room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
ADD COLUMN service_id UUID REFERENCES public.services(id) ON DELETE CASCADE;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_gallery_room_id ON public.gallery(room_id);
CREATE INDEX IF NOT EXISTS idx_gallery_service_id ON public.gallery(service_id);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
