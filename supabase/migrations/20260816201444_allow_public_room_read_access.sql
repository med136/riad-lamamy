-- Only rooms explicitly marked as available are public website content.
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.rooms TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view available rooms" ON public.rooms;
CREATE POLICY "Public can view available rooms"
  ON public.rooms
  FOR SELECT
  TO anon, authenticated
  USING (status = 'available');
