-- Types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'support', 'marketing', 'accounting', 'user');
CREATE TYPE entity_status AS ENUM ('pending', 'completed', 'failed', 'processing');

-- Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  credits INTEGER DEFAULT 50 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Plans
CREATE TABLE public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  credits INTEGER NOT NULL,
  limits JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tracks
CREATE TABLE public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  style TEXT,
  prompt TEXT,
  audio_url TEXT,
  duration TEXT,
  size_mb NUMERIC(5, 2),
  status entity_status DEFAULT 'completed'::entity_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Videos (Shorts)
CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT,
  duration TEXT,
  size_mb NUMERIC(5, 2),
  downloads INTEGER DEFAULT 0,
  status entity_status DEFAULT 'completed'::entity_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  provider TEXT NOT NULL,
  reference TEXT UNIQUE,
  status entity_status DEFAULT 'completed'::entity_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Support Tickets
CREATE TABLE public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- API Logs
CREATE TABLE public.api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_name TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  is_error BOOLEAN DEFAULT false,
  error_message TEXT,
  estimated_cost NUMERIC(10, 5) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (For now, just allow reading their own data)
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active plans." ON public.plans FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own tracks." ON public.tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tracks." ON public.tracks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own videos." ON public.videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own videos." ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tickets." ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets." ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions & Triggers
-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Dummy data for testing the UI
INSERT INTO public.plans (name, price, credits) VALUES 
('Starter', 9.00, 50),
('Standard', 19.00, 150),
('Premium', 49.00, 500);

-- Create test admin user (Password will be set via auth API, but we create the raw record here or via seed)
