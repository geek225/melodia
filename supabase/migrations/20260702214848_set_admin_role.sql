UPDATE public.profiles
SET role = 'super_admin'::user_role
WHERE email = 'admin@melodia.ai';
