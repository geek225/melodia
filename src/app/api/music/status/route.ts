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
        console.log("Suno Status Data:", JSON.stringify(result?.data?.status), "taskId:", taskId);
        const statusData = result.data;
        const currentStatus = (statusData?.status || '').toUpperCase();
        
        if (currentStatus === "SUCCESS" || currentStatus === "TEXT_SUCCESS" || currentStatus === "COMPLETE") {
          // Chercher l'URL audio dans les différentes structures possibles
          const sunoDataArr = statusData?.response?.sunoData || [];
          const sunoTrack = sunoDataArr[0];

          const finalAudioUrl =
            sunoTrack?.audioUrl ||
            sunoTrack?.audio_url ||
            sunoTrack?.streamAudioUrl ||
            statusData?.response?.audioUrl ||
            statusData?.response?.audio_url ||
            statusData?.audioUrl ||
            null;

          const finalCoverUrl =
            sunoTrack?.imageUrl ||
            sunoTrack?.image_url ||
            statusData?.response?.imageUrl ||
            track.cover_url ||
            null;

          const finalLyrics =
            sunoTrack?.metadata?.prompt ||
            sunoTrack?.prompt ||
            statusData?.response?.prompt ||
            track.lyrics ||
            null;
            
          if (finalAudioUrl) {
            let permanentAudioUrl = finalAudioUrl;
            const permanentCoverUrl = finalCoverUrl;

            // Sauvegarde de l'audio sur Supabase Storage
            try {
              console.log(`⏳ Téléchargement de l'audio depuis: ${finalAudioUrl}`);
              const audioRes = await fetch(finalAudioUrl);
              if (audioRes.ok) {
                const arrayBuffer = await audioRes.arrayBuffer();
                const fileName = `track_${taskId}_${Date.now()}.mp3`;

                // Vérification et création du bucket "tracks" s'il n'existe pas
                const { data: buckets } = await adminClient.storage.listBuckets();
                const tracksBucketExists = buckets?.some((b: { name: string }) => b.name === 'tracks');
                if (!tracksBucketExists) {
                  await adminClient.storage.createBucket('tracks', { public: true });
                }

                // Upload vers Supabase Storage
                const { error: uploadError } = await adminClient.storage
                  .from('tracks')
                  .upload(fileName, arrayBuffer, {
                    contentType: 'audio/mpeg',
                    upsert: true
                  });

                if (!uploadError) {
                  const { data: { publicUrl } } = adminClient.storage
                    .from('tracks')
                    .getPublicUrl(fileName);
                  permanentAudioUrl = publicUrl;
                  console.log(`✅ Fichier audio sauvegardé: ${permanentAudioUrl}`);
                } else {
                  console.error("❌ Erreur upload audio:", uploadError);
                }
              }
            } catch (err) {
              console.error("❌ Exception lors de la sauvegarde de l'audio:", err);
            }

            // (Optionnel) on pourrait aussi faire de même pour permanentCoverUrl si on le souhaite

            await adminClient
              .from('tracks')
              .update({
                status: 'completed',
                audio_url: permanentAudioUrl,
                cover_url: permanentCoverUrl,
                lyrics: finalLyrics
              })
              .eq('id', track.id);
              
            return NextResponse.json({ 
              ...track, 
              status: 'completed', 
              audio_url: permanentAudioUrl, 
              cover_url: permanentCoverUrl, 
              lyrics: finalLyrics 
            });
          }
        } else if (currentStatus === "FAILED" || currentStatus === "FAILURE" || currentStatus === "SENSITIVE_WORD_ERROR" || currentStatus.includes("ERROR")) {
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
