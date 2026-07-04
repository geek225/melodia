-- Change default credits for new users from 50 to 30
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 30;

-- Enable Realtime for the tracks table to allow frontend listeners
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracks;
