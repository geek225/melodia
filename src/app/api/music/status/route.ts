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
      const apiKey = process.env.SUNO_API_KEY || "d2bc9f7d7213c3adff53851705b3e6ac";
      
      // 1. Vérifier le statut de la génération Suno
      const resStatus = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${apiKey}` },
        cache: "no-store"
      });
      
      if (resStatus.ok) {
        const result = await resStatus.json();
        console.log("Suno Status Data:", result);
        const statusData = result.data;
        const currentStatus = statusData?.status?.toUpperCase();
        
        if (currentStatus === "SUCCESS" || currentStatus === "TEXT_SUCCESS") {
          const sunoTrack = statusData?.response?.sunoData?.[0];
          const finalAudioUrl = sunoTrack?.audioUrl || sunoTrack?.streamAudioUrl;
            
          if (finalAudioUrl) {
            const finalCoverUrl = sunoTrack?.imageUrl || track.cover_url;
            const finalLyrics = sunoTrack?.metadata?.prompt || track.lyrics;
            
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
        } else if (currentStatus === "FAILED" || currentStatus === "FAILURE" || currentStatus === "SENSITIVE_WORD_ERROR" || currentStatus?.includes("ERROR")) {
          await adminClient.from('tracks').update({ status: 'failed' }).eq('id', track.id);
          return NextResponse.json({ ...track, status: 'failed', error: statusData?.errorMessage || 'Erreur de génération' });
        }
      }
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error in status polling route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
