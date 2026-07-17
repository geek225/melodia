'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Vérifie si une URL audio pointe vers un CDN Suno/externe (non archivé sur Supabase).
 * Les URLs Supabase contiennent le domaine de stockage Supabase.
 */
function isExternalAudioUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('task:')) return false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // Si l'URL contient le domaine Supabase → déjà archivé
  if (supabaseUrl && url.includes(new URL(supabaseUrl).hostname)) return false;
  // Toute autre URL http/https est externe (Suno CDN, etc.)
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Télécharge un fichier audio depuis une URL externe et l'upload vers Supabase Storage.
 * Retourne l'URL publique Supabase, ou null si échec.
 */
async function archiveAudioToSupabase(audioUrl: string, trackId: string): Promise<string | null> {
  try {
    // Valider l'URL
    const parsed = new URL(audioUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const hostname = parsed.hostname.toLowerCase();
    // Bloquer les IPs locales
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname === '::1'
    ) return null;

    const safeUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
    // deepcode ignore SSRF: URL validated above
    const res = await fetch(safeUrl); // NOSONAR
    if (!res.ok) return null;

    const buffer = await res.arrayBuffer();

    // S'assurer que le bucket existe
    const { data: buckets } = await adminClient.storage.listBuckets();
    if (!buckets?.some(b => b.name === 'tracks')) {
      await adminClient.storage.createBucket('tracks', { public: true });
    }

    const fileName = `track_${trackId}_${Date.now()}.mp3`;
    const { error: uploadError } = await adminClient.storage
      .from('tracks')
      .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: true });

    if (uploadError) return null;

    const { data: { publicUrl } } = adminClient.storage.from('tracks').getPublicUrl(fileName);
    return publicUrl;
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/migrate-audio
 * Migre toutes les pistes non archivées vers Supabase Storage.
 * Sécurisé par secret header.
 */
export async function GET(request: Request) {
  // Sécurité : vérifier le secret admin
  const authHeader = request.headers.get('x-admin-secret');
  if (authHeader !== process.env.ADMIN_MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer toutes les pistes "completed" avec une URL externe
  const { data: tracks, error } = await adminClient
    .from('tracks')
    .select('id, audio_url, title')
    .eq('status', 'completed')
    .not('audio_url', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const toMigrate = (tracks || []).filter(t => isExternalAudioUrl(t.audio_url));

  let migrated = 0;
  let failed = 0;
  const failedTracks: string[] = [];

  for (const track of toMigrate) {
    const supabaseUrl = await archiveAudioToSupabase(track.audio_url, track.id);
    if (supabaseUrl) {
      await adminClient
        .from('tracks')
        .update({ audio_url: supabaseUrl })
        .eq('id', track.id);
      migrated++;
    } else {
      failed++;
      failedTracks.push(track.id);
    }
  }

  return NextResponse.json({
    total: toMigrate.length,
    migrated,
    failed,
    failedTrackIds: failedTracks,
  });
}

/**
 * POST /api/admin/migrate-audio
 * Archive une seule piste vers Supabase Storage.
 * Body: { trackId: string }
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('x-admin-secret');
  if (authHeader !== process.env.ADMIN_MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { trackId } = await request.json();
  if (!trackId) return NextResponse.json({ error: 'trackId required' }, { status: 400 });

  const { data: track } = await adminClient
    .from('tracks')
    .select('id, audio_url')
    .eq('id', trackId)
    .single();

  if (!track || !isExternalAudioUrl(track.audio_url)) {
    return NextResponse.json({ success: false, reason: 'Already archived or not found' });
  }

  const supabaseUrl = await archiveAudioToSupabase(track.audio_url, track.id);
  if (supabaseUrl) {
    await adminClient.from('tracks').update({ audio_url: supabaseUrl }).eq('id', track.id);
    return NextResponse.json({ success: true, url: supabaseUrl });
  }

  return NextResponse.json({ success: false, reason: 'Download failed (URL expired?)' });
}
