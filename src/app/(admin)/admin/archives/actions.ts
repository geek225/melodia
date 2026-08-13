"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-admin";

function getAdminAuthClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getSupabaseStorageHost() {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost').hostname; } catch { return ''; }
}

export async function getArchivedTracks() {
  try {
    await requireAdmin();
    const adminAuthClient = getAdminAuthClient();
    const { data, error } = await adminAuthClient
      .from('tracks')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const host = getSupabaseStorageHost();
    const archived = data.filter(t => t.audio_url && host && t.audio_url.includes(host));
    return { success: true, data: archived };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
