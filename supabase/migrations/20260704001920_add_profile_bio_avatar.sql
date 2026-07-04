-- Add bio and avatar_gender columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_gender TEXT DEFAULT 'male';
