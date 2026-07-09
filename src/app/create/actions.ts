'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ratelimit } from '@/lib/rate-limit'

import { z } from 'zod'

const trackSchema = z.object({
  title: z.string().max(100, "Le titre ne doit pas dépasser 100 caractères").optional().default("Nouvelle Musique"),
  prompt: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional().default(""),
  style: z.string().min(1, "Le style est requis").max(50, "Le style est trop long"),
  mood: z.string().max(50).optional().default(""),
  language: z.string().max(50).optional().default("fr"),
  voice: z.string().max(50).optional().default(""),
  duration: z.string().max(20).optional().default("2min30s"),
  coverUrl: z.string().url().optional().nullable(),
  voiceUrl: z.string().url().optional().nullable(),
  promptAudioUrl: z.string().url().optional().nullable()
})

export type TrackFormData = z.infer<typeof trackSchema>;

export async function createTrack(formData: TrackFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // -1. Vérifier le Rate Limiting (Anti-Spam)
  const { success: rateLimitSuccess } = await ratelimit.limit(user.id);
  if (!rateLimitSuccess) {
    console.warn(`Rate limit exceeded for user: ${user.id}`);
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', message: "Vous faites trop de demandes. Veuillez patienter une minute." };
  }

  // 0. Valider les données d'entrée avec Zod (Sécurité)
  const validationResult = trackSchema.safeParse(formData)
  
  if (!validationResult.success) {
    console.error("Validation error:", validationResult.error.format());
    return { success: false, error: 'VALIDATION_ERROR', message: validationResult.error.issues[0].message }
  }

  const validData = validationResult.data;

  // Créer un client admin pour contourner le RLS temporairement
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Vérifier le solde de Mélodies
  const cost = (validData.voiceUrl || validData.promptAudioUrl) ? 15 : 10;
  
  const { data: profile, error: profileError } = await adminAuthClient
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError, "Profile:", profile);
    throw new Error(`Erreur lors de la récupération du profil: ${profileError?.message || 'Profil non trouvé'}`)
  }

  if (profile.credits < cost) {
    return { success: false, error: 'INSUFFICIENT_FUNDS' }
  }

  // 2. Déduire les Mélodies
  const { error: updateError } = await adminAuthClient
    .from('profiles')
    .update({ credits: profile.credits - cost })
    .eq('id', user.id)

  if (updateError) {
    throw new Error('Erreur lors de la déduction des Mélodies')
  }

  // 3. Appel de l'API Suno
  const apiKey = process.env.SUNO_API_KEY || "d2bc9f7d7213c3adff53851705b3e6ac";
  
  let apiTaskId = null;
  let lyricsText = "";
  
  try {
    const styleEnrichments: Record<string, string> = {
      // AFRIQUE DE L'OUEST
      "Coupé-Décalé": "Afro-pop club banger, 135bpm, fast rhythmic guitar, dry snare, four-on-the-floor heavy kick drum, crowd animation, highly energetic party anthem, call-and-response, authentic west african accent, raw expressive vocals",
      "Rap Ivoire / Drill": "Hardcore Drill beat, sliding 808 sub-bass, rapid hi-hats, street slang vocal delivery, aggressive and confident fast rap flow, modern hip hop club banger, dark cinematic melody, authentic west african accent",
      "Zouglou": "Traditional urban influence, acoustic percussion, philosophic storytelling, lead vocal with choir response, nostalgic vibe, authentic west african accent, emotional storytelling vocals",
      "Afrobeats": "Modern Afrobeats, smooth 105bpm, warm sub-bass, syncopated percussion, highly realistic, emotional delivery, authentic african accent",
      "Mbalax": "Modern african pop, talking drum, fast polyrhythmic, energetic dance music, rhythmic beat, authentic senegalese accent, raw expressive vocals",
      // AFRIQUE CENTRALE
      "Rumba Congolaise": "Slow tempo, romantic, smooth vocals, elegant, highly realistic, african acoustic guitar, authentic congolese accent, passionate vocals",
      "Afro-Congo": "Afro-pop, fast danceable beat, animator shouts, energetic, club banger, authentic congolese accent",
      // AFRIQUE SUD & EST
      "Amapiano": "African deep house, signature log drum bassline, 112bpm, smooth chords, shaker loop, soulful vocal chops, extremely realistic, authentic south african accent",
      "Bongo Flava": "East african pop, sweet melodies, upbeat, rhythmic, authentic east african accent, smooth expressive vocals",
      // MAGHREB & DIASPORA
      "Raï / Pop Urbaine": "Modern urban pop, autotune vocals, maghreb melodies, darbuka percussion, oriental synth, trap drums, authentic maghrebi accent, expressive vocals",
      "Kizomba": "Slow sensual beat, romantic rhythm, acoustic guitar, soft vocals, authentic lusophone african accent, emotional delivery",
      "Pop / R&B": "Pop, contemporary R&B, smooth vocals, modern beat, emotional, melodic, radio hit, clear french accent, pure human vocals",
      "Gospel": "Gospel, uplifting choir, spiritual, soulful vocals, praise, organ, warm, highly realistic, clear french accent, powerful emotional human vocals"
    };
    
    const voiceTag = validData.voice === "Homme" ? "authentic human male vocal" : validData.voice === "Femme" ? "authentic human female vocal" : "";
    const enrichedStyle = (styleEnrichments[validData.style] || validData.style) + (voiceTag ? `, ${voiceTag}` : "") + ", sung in French";

    // --- ETAPE 1 : GENERER LES PAROLES ---
    const lyricsSubject = validData.prompt || validData.title || "une belle chanson entraînante";
    const lyricsPrompt = `Chanson en français. Sujet : ${lyricsSubject}. Format court avec intro, couplet, refrain, fin nette.`;
      
    const lyricsRes = await fetch("https://api.sunoapi.org/api/v1/lyrics", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: lyricsPrompt, callBackUrl: "https://melodia.vercel.app/api/webhook/lyrics" })
    });

    if (lyricsRes && lyricsRes.ok) {
      const result = await lyricsRes.json();
      if (result.code === 200 && result.data?.taskId) {
        const lyricsTaskId = result.data.taskId;
        // Polling pour récupérer les paroles (max 10 secondes = 5 essais de 2s)
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const checkRes = await fetch(`https://api.sunoapi.org/api/v1/lyrics/record-info?taskId=${lyricsTaskId}`, {
            headers: { "Authorization": `Bearer ${apiKey}` },
            cache: "no-store"
          });
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.data?.status === "SUCCESS" && checkData.data?.response?.data?.[0]?.text) {
              lyricsText = checkData.data.response.data[0].text;
              break;
            } else if (checkData.data?.status?.includes("FAILED") || checkData.data?.status === "SENSITIVE_WORD_ERROR") {
              break;
            }
          }
        }
      }
    }

    // Fallback de sécurité si les paroles échouent (pour ne pas bloquer l'utilisateur)
    if (!lyricsText) {
      lyricsText = `[Intro]\n[Verse 1]\n${validData.prompt || "Chant en français"}\n[Chorus]\nOn y va !\n[Outro]`;
    }

    // --- ETAPE 2 : GENERER LA MUSIQUE EN MODE CUSTOM ---
    const audioInputUrl = validData.promptAudioUrl || validData.voiceUrl;

    const apiRes = await fetch("https://api.sunoapi.org/api/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: lyricsText || "",
        style: enrichedStyle,
        title: validData.title || "Nouvelle Musique",
        instrumental: false,
        customMode: true, // Le mode Pro avec tags purs
        model: "V3_5",
        callBackUrl: "https://melodia.vercel.app/api/webhook",
        ...(audioInputUrl ? { 
          uploadUrl: audioInputUrl, 
          audioUrl: audioInputUrl, 
          audio_url: audioInputUrl,
          reference_audio: audioInputUrl,
          vocal_url: audioInputUrl
        } : {})
      })
    });
    
    if (apiRes.ok) {
      const result = await apiRes.json();
      if (result.code === 200 && result.data?.taskId) {
        apiTaskId = result.data.taskId;
      } else {
        console.error("Erreur Format API Suno:", result);
        throw new Error(`Suno API Error: ${result.msg}`);
      }
    } else {
      const errorText = await apiRes.text();
      console.error("Erreur HTTP API Suno:", errorText);
      throw new Error(`Suno API HTTP Error: ${apiRes.status}`);
    }
  } catch (err) {
    console.error("Erreur réseau API MusicAPI:", err);
    // Si l'API échoue, on rembourse et on arrête
    await adminAuthClient
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id);
    throw new Error("L'API de génération musicale a rencontré une erreur.");
  }

  if (!apiTaskId) {
    // Si pas de task ID, on rembourse et on arrête
    await adminAuthClient
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id);
    throw new Error("L'API a refusé la génération.");
  }

  // 4. Création de la musique dans la base de données
  const finalCoverUrl = validData.coverUrl || "/images/logo.png";
  
  const { data, error } = await supabase
    .from('tracks')
    .insert([
      {
        user_id: user.id,
        title: validData.title,
        prompt: validData.prompt,
        lyrics: lyricsText, // Save the generated lyrics
        style: validData.style,
        duration: validData.duration,
        status: 'processing',
        audio_url: apiTaskId ? `task:${apiTaskId}` : null,
        cover_url: finalCoverUrl
      }
    ])
    .select()

  if (error || !data || data.length === 0) {
    console.error("Erreur lors de l'insertion de la track dans Supabase:", error);
    // Si la création échoue, on rembourse les Mélodies
    await adminAuthClient
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id)
    throw new Error('Erreur lors de la création de la musique')
  }

  // Return the track ID and success status
  return { success: true, trackId: data[0].id }
}
