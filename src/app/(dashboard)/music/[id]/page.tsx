import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import MusicPlayerClient from "./MusicPlayerClient";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function MusicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  let { data: track } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single();

  if (!track) {
    notFound();
  }

  // Si la track est toujours en cours de génération, on vérifie l'API
    if (track.status === 'processing' && track.audio_url?.startsWith('task:')) {
      const taskId = track.audio_url.replace('task:', '');
      const apiKey = process.env.SUNO_API_KEY || "d2bc9f7d7213c3adff53851705b3e6ac";
      
      try {
        // 1. Vérifier le statut de la génération Suno
        const resStatus = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${apiKey}` },
          cache: "no-store"
        });
        
        if (resStatus.ok) {
          const result = await resStatus.json();
          const statusData = result.data;
          const currentStatus = statusData?.status?.toUpperCase();
          
          if (currentStatus === "SUCCESS" || currentStatus === "TEXT_SUCCESS") {
            const sunoTrack = statusData?.response?.sunoData?.[0];
            const finalAudioUrl = sunoTrack?.audioUrl || sunoTrack?.streamAudioUrl;
              
            if (finalAudioUrl) {
              const finalCoverUrl = sunoTrack?.imageUrl || track.cover_url;
              const finalLyrics = sunoTrack?.prompt || track.lyrics;
              
              const adminClient = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
              );
              
              await adminClient
                .from('tracks')
                .update({
                  status: 'completed',
                  audio_url: finalAudioUrl,
                  cover_url: finalCoverUrl,
                  lyrics: finalLyrics
                })
                .eq('id', track.id);
                
              track = { ...track, status: 'completed', audio_url: finalAudioUrl, cover_url: finalCoverUrl, lyrics: finalLyrics };
            }
          } else if (currentStatus === "FAILED" || currentStatus === "FAILURE") {
            const adminClient = createSupabaseClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            await adminClient.from('tracks').update({ status: 'failed' }).eq('id', track.id);
            track.status = 'failed';
          }
        }
      } catch (e) {
        console.error("Erreur lors de la vérification de l'API Suno:", e);
      }
    }

  return (
    <div className="space-y-8 pb-20">
      <Link href="/music" className="text-muted-foreground hover:text-foreground text-sm font-medium">
        ← Retour à ma musique
      </Link>
      
      <MusicPlayerClient track={track} />
    </div>
  );
}
