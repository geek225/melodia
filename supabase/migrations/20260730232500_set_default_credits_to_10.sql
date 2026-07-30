-- Change default credits for new users from 30 (or 50) to 10
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 10;
