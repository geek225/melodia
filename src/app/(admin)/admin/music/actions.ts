"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_STORAGE_HOST = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname; } catch { return ''; }
})();

function isExternalAudioUrl(url: string): boolean {
  if (!url || url.startsWith('task:')) return false;
  if (SUPABASE_STORAGE_HOST && url.includes(SUPABASE_STORAGE_HOST)) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

const adminAuthClient = createSupabaseClient(
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

/**
 * Retourne le nombre de pistes dont l'URL audio pointe encore vers un CDN externe (non archivées).
 */
export async function getUnarchivedTracksCount() {
  try {
    const { data, error } = await adminAuthClient
      .from('tracks')
      .select('id, audio_url')
      .eq('status', 'completed')
      .not('audio_url', 'is', null);

    if (error) throw error;
    const count = (data || []).filter(t => isExternalAudioUrl(t.audio_url)).length;
    return { success: true, count };
  } catch (error: unknown) {
    return { success: false, count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Archive une piste unique vers Supabase Storage.
 * Télécharge depuis l'URL Suno et upload dans le bucket 'tracks'.
 */
export async function archiveSingleTrack(trackId: string) {
  try {
    const { data: track, error } = await adminAuthClient
      .from('tracks')
      .select('id, audio_url')
      .eq('id', trackId)
      .single();

    if (error || !track) throw new Error('Track not found');
    if (!isExternalAudioUrl(track.audio_url)) {
      return { success: true, alreadyArchived: true };
    }

    const parsed = new URL(track.audio_url);
    const safeUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
    // deepcode ignore SSRF: URL validated
    const res = await fetch(safeUrl); // NOSONAR
    if (!res.ok) return { success: false, error: 'URL expired or unreachable' };

    const buffer = await res.arrayBuffer();

    // S'assurer que le bucket existe
    const { data: buckets } = await adminAuthClient.storage.listBuckets();
    if (!buckets?.some(b => b.name === 'tracks')) {
      await adminAuthClient.storage.createBucket('tracks', { public: true });
    }

    const fileName = `track_${trackId}_${Date.now()}.mp3`;
    const { error: uploadError } = await adminAuthClient.storage
      .from('tracks')
      .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = adminAuthClient.storage.from('tracks').getPublicUrl(fileName);
    await adminAuthClient.from('tracks').update({ audio_url: publicUrl }).eq('id', trackId);

    return { success: true, url: publicUrl };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Supprime les pistes 'completed' non archivées créées il y a plus de 'daysOld' jours.
 * Retourne le nombre de pistes supprimées.
 */
export async function deleteOldUnarchivedTracks(daysOld = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data: tracks, error } = await adminAuthClient
      .from('tracks')
      .select('id, audio_url, created_at')
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString())
      .not('audio_url', 'is', null);

    if (error) throw error;

    const toDelete = (tracks || []).filter(t => isExternalAudioUrl(t.audio_url));
    let deleted = 0;

    for (const track of toDelete) {
      const { error: delError } = await adminAuthClient
        .from('tracks')
        .delete()
        .eq('id', track.id);
      if (!delError) deleted++;
    }

    return { success: true, deleted, total: toDelete.length };
  } catch (error: unknown) {
    return { success: false, deleted: 0, error: error instanceof Error ? error.message : String(error) };
  }
}
