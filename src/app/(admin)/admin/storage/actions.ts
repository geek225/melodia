"use server";

import { createClient } from "@supabase/supabase-js";

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminStorageStats() {
  try {
    const buckets = ['tracks', 'covers', 'avatars', 'logs', 'voices', 'music_covers'];
    const storageStats = [];

    for (const bucket of buckets) {
      let totalSize = 0;
      let totalFiles = 0;

      // Fetch files (up to 1000 for MVP stats)
      const { data, error } = await adminAuthClient.storage.from(bucket).list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (!error && data) {
        // filter out the empty placeholder files
        const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        totalFiles = validFiles.length;
        totalSize = validFiles.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
      }

      storageStats.push({
        bucket,
        files: totalFiles,
        sizeBytes: totalSize,
      });
    }

    return { success: true, data: storageStats };
  } catch (error: unknown) {
    console.error("Error fetching admin storage:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function cleanupOldStorage(daysToKeep = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 1. Trouver les fichiers dans le bucket "tracks" qui sont vieux
    const { data: files, error: listError } = await adminAuthClient.storage.from('tracks').list('', { limit: 5000 });
    
    let deletedCount = 0;
    if (!listError && files) {
      const filesToDelete = files
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .filter(f => f.created_at && new Date(f.created_at) < cutoffDate)
        .map(f => f.name);

      if (filesToDelete.length > 0) {
        // 2. Supprimer les fichiers
        const { error: removeError } = await adminAuthClient.storage.from('tracks').remove(filesToDelete);
        if (!removeError) {
          deletedCount = filesToDelete.length;
        }
      }
    }

    // 3. Mettre à jour la base de données (mettre audio_url à null pour les anciens)
    await adminAuthClient
      .from('tracks')
      .update({ audio_url: null })
      .lt('created_at', cutoffDate.toISOString())
      .not('audio_url', 'is', null);

    return { success: true, count: deletedCount };
  } catch (error: unknown) {
    console.error("Error during storage cleanup:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
