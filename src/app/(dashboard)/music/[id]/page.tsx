import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import MusicPlayerClient from "./MusicPlayerClient";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
    const apiKey = process.env.TREBLO_API_KEY || "sksonauto_48dtMwZYfnrRApJ0JAZ5p09Ep9w10p4xgDMSUQjrkf3JWu4I";
    
    try {
      // 1. Vérifier le statut de la génération Treblo
      const resStatus = await fetch(`https://api.treblo.com/v1/generations/status/${taskId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${apiKey}` },
        cache: "no-store"
      });
      
      if (resStatus.ok) {
        const statusData = await resStatus.json();
        const currentStatus = typeof statusData === 'string' ? statusData : statusData?.status;
        
        if (currentStatus === "SUCCESS") {
          // 2. Si succès, récupérer les détails (URL audio)
          const resDetails = await fetch(`https://api.treblo.com/v1/generations/${taskId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` },
            cache: "no-store"
          });

          if (resDetails.ok) {
            const detailsData = await resDetails.json();
            
            // Treblo renvoie song_paths (un tableau)
            const finalAudioUrl = detailsData.song_paths?.[0];
            
            if (finalAudioUrl) {
              const finalCoverUrl = detailsData.image_url || track.cover_url;
              const finalLyrics = detailsData.lyrics || track.lyrics;
              
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
          }
        } else if (currentStatus === "FAILURE") {
          const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          await adminClient.from('tracks').update({ status: 'failed' }).eq('id', track.id);
          track.status = 'failed';
        }
      }
    } catch (e) {
      console.error("Erreur lors de la vérification de l'API Treblo:", e);
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
