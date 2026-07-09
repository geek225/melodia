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
