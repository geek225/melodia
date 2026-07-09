"use server";

import { createClient } from "@supabase/supabase-js";

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminTracks() {
  try {
    const { data, error } = await adminAuthClient
      .from('tracks')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error fetching admin tracks:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function toggleFeaturedTrack(trackId: string, currentStatus: boolean) {
  try {
    if (!currentStatus) {
      // Trying to feature it. Check how many are currently featured.
      const { count, error: countError } = await adminAuthClient
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);
        
      if (countError) throw countError;
      
      if (count !== null && count >= 5) {
        return { success: false, error: 'La limite de 5 chansons mises en avant est atteinte.' };
      }
    }

    const { error } = await adminAuthClient
      .from('tracks')
      .update({ is_featured: !currentStatus })
      .eq('id', trackId);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Error toggling featured track:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
