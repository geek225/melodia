-- 1. Add cover_url and lyrics to tracks
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS lyrics TEXT;

-- 2. Update plans to FCFA and new Melodies system
-- First, disable old plans to keep transaction history safe, or just clear them since it's dev.
-- Let's just delete them if no transactions depend on them, or deactivate them.
UPDATE public.plans SET is_active = false;

INSERT INTO public.plans (name, price, credits) VALUES 
('Pack Découverte', 1500.00, 10),
('Pack Starter', 3500.00, 30),
('Pack Créateur', 6500.00, 60),
('Pack Studio', 12000.00, 120),
('Pack Producteur', 22000.00, 250);

-- 3. Create Storage Bucket for Covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music_covers', 'music_covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for music_covers
CREATE POLICY "Public access to music covers" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'music_covers' );

CREATE POLICY "Authenticated users can upload covers" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'music_covers' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update own covers" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'music_covers' AND auth.uid() = owner ) 
WITH CHECK ( bucket_id = 'music_covers' AND auth.uid() = owner );

CREATE POLICY "Users can delete own covers" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'music_covers' AND auth.uid() = owner );
