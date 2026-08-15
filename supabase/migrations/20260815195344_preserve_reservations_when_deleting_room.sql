-- Keep reservation history when an associated room is removed.
-- room_id is nullable, so existing reservations remain valid without a room.
ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_room_id_fkey;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_room_id_fkey
  FOREIGN KEY (room_id)
  REFERENCES public.rooms(id)
  ON DELETE SET NULL;
