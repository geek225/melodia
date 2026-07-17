'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ratelimit } from '@/lib/rate-limit'
import { buildEnrichedStyle, buildEnrichedLyricsPrompt } from '@/lib/music-knowledge'

import { z } from 'zod'

const trackSchema = z.object({
  title: z.string().max(100, "Le titre ne doit pas dépasser 100 caractères").optional().default("Nouvelle Musique"),
  prompt: z.string().max(5000, "La description ne doit pas dépasser 5000 caractères").optional().default(""),
  style: z.string().min(1, "Le style est requis").max(200, "Le style est trop long"),
  styles: z.array(z.string()).max(3).optional().default([]),
  mood: z.string().max(50).optional().default(""),
  language: z.string().max(50).optional().default("fr"),
  voice: z.string().max(50).optional().default(""),
  duration: z.string().max(20).optional().default("2min30s"),
  coverUrl: z.string().url().optional().nullable(),
  voiceUrl: z.string().url().optional().nullable(),
  promptAudioUrl: z.string().url().optional().nullable(),
  // Durée réelle de l'enregistrement vocal (en secondes) — requis par /upload-extend
  audioRecordingDuration: z.number().min(1).max(150).optional().default(28)
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
    return { success: false, error: `Erreur lors de la récupération du profil: ${profileError?.message || 'Profil non trouvé'}` }
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
    console.error("Deduction error:", updateError);
    return { success: false, error: 'Erreur lors de la déduction des Mélodies' }
  }

  // 3. Appel de l'API Suno
  const apiKey = process.env.SUNO_API_KEY || "d2bc9f7d7213c3adff53851705b3e6ac";
  
  let apiTaskId = null;
  let lyricsText = "";
  
  try {
    const voiceTag = validData.voice === "Homme"
      ? "male vocals"
      : validData.voice === "Femme"
      ? "female vocals"
      : "human vocal";

    const selectedStyles = validData.styles && validData.styles.length > 0 ? validData.styles : [validData.style];

    // Utiliser la knowledge base pour construire un style enrichi et précis
    const enrichedStyle = buildEnrichedStyle(selectedStyles, voiceTag);

    // --- ETAPE 1 : GENERER LES PAROLES ---
    lyricsText = "";
    const audioInputUrl = validData.promptAudioUrl || validData.voiceUrl;

    if (!audioInputUrl) {
      // Si le texte dépasse 200 caractères ou contient des balises de structure, on considère que ce sont les paroles finales
      if (validData.prompt && (validData.prompt.length > 200 || (validData.prompt.includes("[") && validData.prompt.includes("]")))) {
        lyricsText = validData.prompt;
      } else {
        const lyricsSubject = validData.prompt || validData.title || "une belle chanson entraînante";
        const lyricsPrompt = buildEnrichedLyricsPrompt(selectedStyles[0], lyricsSubject);
        
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
      }
    } else {
      lyricsText = validData.prompt ? (validData.prompt + "\n[End]") : " ";
    }

    // Fallback de sécurité si les paroles échouent (pour ne pas bloquer l'utilisateur)
    if (!lyricsText && !audioInputUrl) {
      lyricsText = `[Intro]\n[Verse 1]\n${validData.prompt || "Chant en français"}\n[Chorus]\nOn y va !\n[Outro]`;
    }

    // --- ETAPE 2 : GENERER LA MUSIQUE ---
    let apiRes: Response;

    if (audioInputUrl) {
      // ✅ RETOUR AU COMPORTEMENT "COVER" MAGIQUE (Create from Audio)
      // On utilise la voix et on limite la durée.
      
      // On utilise V4 ou V5 car V4_5 va jusqu'à 8 minutes. V4 et V5 sont limités à 4 min max.
      const selectedModel = "V5";
      
      // On force la fin rapide dans les paroles pour ne pas dépasser ~2m30
      const finalPrompt = (lyricsText || " ") + "\n\n[Outro]\n[Fade Out]\n[End]";

      apiRes = await fetch("https://api.sunoapi.org/api/v1/generate/upload-cover", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uploadUrl: audioInputUrl,
          customMode: true,
          instrumental: false,
          prompt: finalPrompt,
          style: enrichedStyle,
          title: validData.title || "Nouvelle Musique",
          model: selectedModel,
          audioWeight: 0.95, // Force la conservation de la voix d'origine (comme au studio)
          callBackUrl: "https://melodia.vercel.app/api/webhook"
        })
      });
    } else {
      // Génération normale sans audio de référence
      apiRes = await fetch("https://api.sunoapi.org/api/v1/generate", {
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
          customMode: true,
          model: "V4_5",
          callBackUrl: "https://melodia.vercel.app/api/webhook"
        })
      });
    }
    
    if (apiRes.ok) {
      const result = await apiRes.json();
      if (result.code === 200 && result.data?.taskId) {
        apiTaskId = result.data.taskId;
      } else {
        console.error("Erreur Format API Suno:", result);
        // On rembourse l'utilisateur
        await adminAuthClient.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
        return { success: false, error: `Erreur API Suno: ${result.msg || 'Format invalide'}` };
      }
    } else {
      const errorText = await apiRes.text();
      console.error("Erreur HTTP API Suno:", apiRes.status, errorText);
      // On rembourse l'utilisateur
      await adminAuthClient.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
      return { success: false, error: "Erreur de connexion à l'API Suno." };
    }
  } catch (err) {
    console.error("Erreur réseau API MusicAPI:", err);
    // Si l'API échoue, on rembourse et on arrête
    await adminAuthClient
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id);
    return { success: false, error: "L'API de génération musicale a rencontré une erreur." };
  }

  if (!apiTaskId) {
    // Si pas de task ID, on rembourse et on arrête
    await adminAuthClient
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id);
    return { success: false, error: "L'API a refusé la génération." };
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
    return { success: false, error: 'Erreur lors de la création de la musique' }
  }

  // Return the track ID and success status
  return { success: true, trackId: data[0].id }
}
