import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Route de callback pour les notifications Suno (génération terminée)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📩 Webhook Suno reçu:", JSON.stringify(body, null, 2));

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Suno peut envoyer le taskId directement ou dans data
    const taskId = body.taskId || body.data?.taskId;
    const status = (body.status || body.data?.status || '').toUpperCase();

    if (!taskId) {
      console.warn("Webhook Suno: aucun taskId trouvé dans le body");
      return NextResponse.json({ ok: true }); // Toujours répondre 200 à Suno
    }

    // Chercher la piste correspondante (audio_url stocké sous forme "task:<taskId>")
    const { data: track, error } = await adminClient
      .from('tracks')
      .select('id, status')
      .eq('audio_url', `task:${taskId}`)
      .single();

    if (error || !track) {
      console.warn(`Webhook Suno: piste non trouvée pour taskId=${taskId}`);
      return NextResponse.json({ ok: true });
    }

    // Extraire l'URL audio depuis les différentes structures possibles de callback
    const sunoDataArr = body.data?.response?.sunoData || body.response?.sunoData || [];
    const sunoTrack = sunoDataArr[0];

    // Structure pour upload-extend : audio_url peut être directement dans body.data
    const audioUrl =
      sunoTrack?.audioUrl ||
      sunoTrack?.audio_url ||
      body.data?.audioUrl ||
      body.data?.audio_url ||
      body.audioUrl ||
      null;

    const imageUrl =
      sunoTrack?.imageUrl ||
      sunoTrack?.image_url ||
      body.data?.imageUrl ||
      body.data?.image_url ||
      null;

    const lyrics =
      sunoTrack?.metadata?.prompt ||
      sunoTrack?.prompt ||
      body.data?.prompt ||
      null;

    if (status === 'SUCCESS' || status === 'TEXT_SUCCESS' || status === 'COMPLETE') {
      if (audioUrl) {
        let finalAudioUrl = audioUrl;

        // Téléchargement du fichier audio depuis Suno pour le stocker de manière permanente
        try {
          console.log(`⏳ Téléchargement de l'audio depuis: ${audioUrl}`);
          const audioRes = await fetch(audioUrl);
          if (audioRes.ok) {
            const arrayBuffer = await audioRes.arrayBuffer();
            const fileName = `track_${taskId}_${Date.now()}.mp3`;

            // Vérification et création du bucket "tracks" s'il n'existe pas
            const { data: buckets } = await adminClient.storage.listBuckets();
            const tracksBucketExists = buckets?.some(b => b.name === 'tracks');
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
              finalAudioUrl = publicUrl;
              console.log(`✅ Fichier audio sauvegardé de manière permanente: ${finalAudioUrl}`);
            } else {
              console.error("❌ Erreur lors de l'upload vers Supabase Storage:", uploadError);
            }
          } else {
             console.error("❌ Erreur de téléchargement depuis l'URL Suno:", audioRes.statusText);
          }
        } catch (uploadErr) {
          console.error("❌ Exception lors de la sauvegarde permanente de l'audio:", uploadErr);
        }

        await adminClient
          .from('tracks')
          .update({
            status: 'completed',
            audio_url: finalAudioUrl,
            ...(imageUrl && { cover_url: imageUrl }),
            ...(lyrics && { lyrics }),
          })
          .eq('id', track.id);

        console.log(`✅ Webhook Suno: piste ${track.id} marquée 'completed'`);
      }
    } else if (
      status === 'FAILED' ||
      status === 'FAILURE' ||
      status === 'SENSITIVE_WORD_ERROR' ||
      status.includes('ERROR')
    ) {
      await adminClient
        .from('tracks')
        .update({ status: 'failed' })
        .eq('id', track.id);

      console.log(`❌ Webhook Suno: piste ${track.id} marquée 'failed' — status: ${status}`);
    }

    // Toujours répondre 200 à Suno pour éviter les retries infinis
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur webhook Suno:", err);
    // Même en cas d'erreur, on répond 200 pour éviter que Suno réessaie indéfiniment
    return NextResponse.json({ ok: true });
  }
}

// Certains providers envoient aussi des GET pour vérifier que l'URL est vivante
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Meliodia Suno Webhook' });
}
