import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('trackId');

  if (!trackId) {
    return NextResponse.json({ error: 'Missing trackId' }, { status: 400 });
  }

  try {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: track, error } = await adminClient
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (error || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (track.status === 'processing' && track.audio_url?.startsWith('task:')) {
      const taskId = track.audio_url.replace('task:', '');
      const apiKey = process.env.TREBLO_API_KEY || "sksonauto_48dtMwZYfnrRApJ0JAZ5p09Ep9w10p4xgDMSUQjrkf3JWu4I";
      
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
            const finalAudioUrl = detailsData.song_paths?.[0] || detailsData.audio_url;
            
            if (finalAudioUrl) {
              const finalCoverUrl = detailsData.image_url || track.cover_url;
              const finalLyrics = detailsData.lyrics || track.lyrics;
              
              await adminClient
                .from('tracks')
                .update({
                  status: 'completed',
                  audio_url: finalAudioUrl,
                  cover_url: finalCoverUrl,
                  lyrics: finalLyrics
                })
                .eq('id', track.id);
                
              return NextResponse.json({ 
                ...track, 
                status: 'completed', 
                audio_url: finalAudioUrl, 
                cover_url: finalCoverUrl, 
                lyrics: finalLyrics 
              });
            }
          }
        } else if (currentStatus === "FAILURE") {
          await adminClient.from('tracks').update({ status: 'failed' }).eq('id', track.id);
          return NextResponse.json({ ...track, status: 'failed' });
        }
      }
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error in status polling route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
