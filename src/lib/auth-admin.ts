import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface AdminSession {
  userId: string;
  email: string | null;
  role: 'admin' | 'super_admin';
}

/**
 * Vérifie que l'utilisateur appelant est authentifié et possède le rôle 'admin' ou 'super_admin'.
 * À appeler en tête de chaque Server Action sensible ou route API d'administration.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Non authentifié. Accès refusé.');
  }

  // Utiliser le client admin pour vérifier le rôle de manière infalsifiable
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Profil utilisateur introuvable.');
  }

  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    throw new Error('Accès interdit. Privilèges administrateur requis.');
  }

  return {
    userId: user.id,
    email: profile.email || user.email || null,
    role: profile.role as 'admin' | 'super_admin',
  };
}

/**
 * Vérifie spécifiquement que l'utilisateur possède le rôle le plus élevé 'super_admin'.
 */
export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAdmin();

  if (session.role !== 'super_admin') {
    throw new Error('Accès interdit. Seul un Super Administrateur peut effectuer cette action.');
  }

  return session;
}
