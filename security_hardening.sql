-- ==========================================
-- SCRIPT DE HARDENING DE SÉCURITÉ SUPABASE
-- ==========================================
-- Ce script verrouille l'accès direct à la base de données.
-- Les utilisateurs ne pourront lire/écrire que LEURS propres données.
-- Seul un admin (via Service Role Key ou Rôle Admin) aura un accès total.

-- 1. Sécurisation de la table PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Sécurisation de la table TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Les utilisateurs peuvent voir leurs transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Interdire l'insertion/modification depuis le frontend (doit passer par le backend API)
CREATE POLICY "Seul le backend peut inserer des transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (false);

-- 3. Sécurisation de la table API_LOGS
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Personne ne peut lire les logs depuis le frontend public
CREATE POLICY "Interdire la lecture publique des logs" 
ON public.api_logs FOR SELECT 
USING (false);

-- 4. Sécurisation de la table NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs voient les notifications globales (user_id IS NULL) ou les leurs
CREATE POLICY "Lecture notifications globales ou perso" 
ON public.notifications FOR SELECT 
USING (user_id IS NULL OR user_id = auth.uid());

-- Interdire la modification/création de notifications depuis le frontend
CREATE POLICY "Seul le backend peut modifier les notifications" 
ON public.notifications FOR ALL 
USING (false) WITH CHECK (false);

-- ==========================================
-- RÈGLE UNIVERSELLE POUR LE BACKEND ADMIN
-- (Le Service Role ignore le RLS automatiquement, 
-- mais on s'assure qu'il n'est pas bloqué si utilisé avec des permissions manuelles)
-- ==========================================
