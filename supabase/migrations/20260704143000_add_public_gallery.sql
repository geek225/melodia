ALTER TABLE public.tracks ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE public.tracks ADD COLUMN likes_count INTEGER DEFAULT 0;
