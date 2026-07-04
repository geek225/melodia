-- Create marketing_campaigns table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage marketing_campaigns" ON public.marketing_campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );


-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON public.reviews
    FOR SELECT
    USING (status = 'approved');

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON public.reviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
