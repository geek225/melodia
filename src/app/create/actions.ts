'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ratelimit } from '@/lib/rate-limit'
import { buildEnrichedStyle, buildEnrichedLyricsPrompt } from '@/lib/music-knowledge'
import { getMusicApiConfig } from '@/lib/music-provider'
import { AFRICAN_PROFILES } from '@/lib/african-profiles'
import { generateLyricsWithGemini } from '@/lib/gemini'

import { z } from 'zod'

const trackSchema = z.object({
  title: z.string().max(100, "Le titre ne doit pas dépasser 100 caractères").optional().default("Nouvelle Musique"),
  prompt: z.string().max(5000, "La description ne doit pas dépasser 5000 caractères").optional().default(""),
  style: z.string().min(1, "Le style est requis").max(200, "Le style est trop long"),
  styles: z.array(z.string()).max(3).optional().default([]),
  africanProfiles: z.array(z.string()).optional().default([]),
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
  
  const { data: profile, error: profileError } = await supabase
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

  // 3. Appel de l'API de Génération Musicale (KIE.AI ou SunoAPI)
  const { baseUrl, apiKey } = getMusicApiConfig();
  
  let apiTaskId = null;
  let lyricsText = "";
  
  try {
    const voice = validData.voice || "Homme";
    const isDuo = voice === "Duo";
    const vocalGender = voice === "Homme" ? "m" : voice === "Femme" ? "f" : undefined;

    const selectedStyles = validData.styles && validData.styles.length > 0 ? validData.styles : [validData.style];

    // Utiliser la knowledge base pour construire un style enrichi et précis avec tag vocal en tête
    const enrichedStyle = buildEnrichedStyle(selectedStyles, voice);

    // --- ETAPE 1 : GENERER LES PAROLES ---
    lyricsText = "";
    const audioInputUrl = validData.promptAudioUrl || validData.voiceUrl;

    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || 'https://melodia.vercel.app').replace(/\/+$/, '');

    if (!audioInputUrl) {
      // Si le texte dépasse 200 caractères ou contient des balises de structure, on considère que ce sont les paroles finales
      if (validData.prompt && (validData.prompt.length > 200 || (validData.prompt.includes("[") && validData.prompt.includes("]")))) {
        lyricsText = validData.prompt;
      } else {
        const lyricsSubject = validData.prompt || validData.title || "une belle chanson entraînante";
        
        // 1. Priorité 1 : Utiliser Google Gemini pour des paroles humaines de studio auteur-compositeur
        const geminiRes = await generateLyricsWithGemini({
          title: validData.title,
          topic: lyricsSubject,
          style: selectedStyles.join(', '),
          mood: validData.mood || "Émouvant & Intime",
          language: validData.language || "Français",
          perspective: isDuo ? "Duo homme et femme" : "",
          toneStyle: "Pop Urbaine & Poétique",
          voice
        });

        if (geminiRes.success && geminiRes.lyrics) {
          lyricsText = geminiRes.lyrics;
        } else {
          // 2. Fallback KIE/Suno si Gemini rencontre un problème
          const lyricsPrompt = buildEnrichedLyricsPrompt(selectedStyles[0], lyricsSubject, isDuo);
          const lyricsRes = await fetch(`${baseUrl}/api/v1/lyrics`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: lyricsPrompt, callBackUrl: `${appOrigin}/api/webhook/lyrics` })
          });

          if (lyricsRes && lyricsRes.ok) {
            const result = await lyricsRes.json();
            if (result.code === 200 && result.data?.taskId) {
              const lyricsTaskId = result.data.taskId;
              for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const checkRes = await fetch(`${baseUrl}/api/v1/lyrics/record-info?taskId=${lyricsTaskId}`, {
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
      }
    } else {
      lyricsText = validData.prompt ? (validData.prompt + "\n[End]") : " ";
    }

    // Fallback de sécurité si les paroles échouent (pour ne pas bloquer l'utilisateur)
    if (!lyricsText && !audioInputUrl) {
      if (isDuo) {
        lyricsText = `[Intro - Duet]\n[Couplet 1 - Male Vocals]\n${validData.prompt || "Je te donne mon cœur et ma vérité"}\n[Couplet 2 - Female Vocals]\nJe reçois ton amour avec sincérité\n[Refrain - Male & Female Duet]\nOn avancera ensemble tous les deux !\n[Outro - Duet]\n[End]`;
      } else if (voice === "Femme") {
        lyricsText = `[Intro - Female Vocals]\n[Couplet 1 - Female Vocals]\n${validData.prompt || "Chant en français"}\n[Refrain - Female Vocals]\nOn y va tous ensemble !\n[Outro - Female Vocals]\n[End]`;
      } else {
        lyricsText = `[Intro - Male Vocals]\n[Couplet 1 - Male Vocals]\n${validData.prompt || "Chant en français"}\n[Refrain - Male Vocals]\nOn y va tous ensemble !\n[Outro - Male Vocals]\n[End]`;
      }
    }

    // Injection du profil sonore africain si sélectionné
    if (validData.africanProfiles && validData.africanProfiles.length > 0) {
      const instructions = validData.africanProfiles.map(id => {
        for (const cat of AFRICAN_PROFILES) {
          const prof = cat.profiles.find(p => p.id === id);
          if (prof) return prof.promptInstruction;
        }
        return null;
      }).filter(Boolean);

      if (instructions.length > 0) {
        const baseStyle = validData.style || "African Music";
        const africanSoundMeta = `\n[Style Instructions: ${baseStyle}. African sound direction: ${instructions.join(". ")}. Use original composition, original melody, original vocal phrasing. Do not imitate, reference, or evoke any specific artist, group, or song.]\n\n`;
        lyricsText = africanSoundMeta + lyricsText;
      }
    }

    // Clôture explicite pour garantir un format radio de 3min - 3min30 max
    if (lyricsText && !lyricsText.includes("[End]")) {
      lyricsText += "\n\n[Outro - Fade Out]\n[End]\n[Silence]";
    }

    // Sécurité stricte sur la taille des paroles (Max 2950 caractères pour respecter la limite absolue de 3000 de Suno)
    let safeLyrics = lyricsText || "";
    if (safeLyrics.length > 2950) {
      const cutLyrics = safeLyrics.substring(0, 2950);
      const lastLineBreak = cutLyrics.lastIndexOf("\n");
      safeLyrics = (lastLineBreak > 1500 ? cutLyrics.substring(0, lastLineBreak) : cutLyrics) + "\n\n[Outro - Fade Out]\n[End]";
    }

    // --- ETAPE 2 : GENERER LA MUSIQUE ---
    let apiRes: Response;

    const negativeTags = "robotic autotune, metallic vocal, bad mixing, distorted vocals, noisy audio, off key, low quality, vocoder, endless loop";

    const safeTitle = (validData.title || "Nouvelle Musique").slice(0, 80);
    const safeStyle = (enrichedStyle || "Afrobeats, 108 BPM").slice(0, 190);

    if (audioInputUrl) {
      // ✅ RETOUR AU COMPORTEMENT "COVER" MAGIQUE (Create from Audio)
      const selectedModel = "V5";
      const finalPrompt = (safeLyrics || " ") + "\n\n[Outro]\n[Fade Out]\n[End]";

      apiRes = await fetch(`${baseUrl}/api/v1/generate/upload-cover`, {
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
          style: safeStyle,
          title: safeTitle,
          model: selectedModel,
          audioWeight: 0.95,
          ...(vocalGender ? { vocalGender } : {}),
          negativeTags,
          callBackUrl: `${appOrigin}/api/webhook`
        })
      });
    } else {
      // Génération normale sans audio de référence : Utilise V4 pour une structure radio maîtrisée de 3 à 4 minutes max
      apiRes = await fetch(`${baseUrl}/api/v1/generate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: safeLyrics || "",
          style: safeStyle,
          title: safeTitle,
          instrumental: false,
          customMode: true,
          model: "V4",
          ...(vocalGender ? { vocalGender } : {}),
          negativeTags,
          callBackUrl: `${appOrigin}/api/webhook`
        })
      });
    }

    const formatFriendlyError = (rawMsg: string) => {
      const msg = (rawMsg || "").toLowerCase();
      if (msg.includes("3000") || msg.includes("lyrics") || msg.includes("prompt")) {
        return "Vos paroles dépassent la limite de 3000 caractères. Veuillez raccourcir légèrement votre texte pour lancer la création.";
      }
      if (msg.includes("200") || msg.includes("style")) {
        return "La combinaison de styles est trop longue. Veuillez sélectionner 1 ou 2 styles principaux.";
      }
      if (msg.includes("sensitive") || msg.includes("moderation") || msg.includes("word_error")) {
        return "Certains termes de vos paroles contiennent des mots sensibles ou protégés. Veuillez modifier votre texte.";
      }
      if (msg.includes("credit") || msg.includes("insufficient")) {
        return "Le service de composition est temporairement surchargé. Veuillez réessayer dans un instant.";
      }
      return "Une erreur est survenue lors de la création de la musique. Veuillez réessayer.";
    };
    
    if (apiRes.ok) {
      const result = await apiRes.json();
      if (result.code === 200 && result.data?.taskId) {
        apiTaskId = result.data.taskId;
      } else {
        console.error("Erreur API Musique:", result);
        // On rembourse l'utilisateur
        await adminAuthClient.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
        return { success: false, error: formatFriendlyError(result.msg || "") };
      }
    } else {
      const errorText = await apiRes.text();
      console.error("Erreur HTTP API Musique:", apiRes.status, errorText);
      // On rembourse l'utilisateur
      await adminAuthClient.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
      return { success: false, error: "Le service de composition musicale est momentanément indisponible. Veuillez réessayer dans quelques instants." };
    }
  } catch (err) {
    console.error("Erreur réseau API Musique:", err);
    // Si l'API échoue, on rembourse et on arrête
    await adminAuthClient
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id);
    return { success: false, error: "Le service de composition musicale est momentanément indisponible. Veuillez réessayer." };
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

const generateLyricsInputSchema = z.object({
  title: z.string().max(100).optional().default(""),
  topic: z.string().max(2000).optional().default(""),
  style: z.string().max(100).optional().default("Afrobeats"),
  mood: z.string().max(100).optional().default("Émouvant & Intime"),
  language: z.string().max(50).optional().default("Français"),
  perspective: z.string().max(200).optional().default(""),
  toneStyle: z.string().max(100).optional().default("Humain & Naturel"),
  voice: z.string().max(50).optional().default("Homme")
});

export type GenerateLyricsParams = z.infer<typeof generateLyricsInputSchema>;

export async function generateAiLyrics(input: GenerateLyricsParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté pour utiliser l'IA de paroles." };
  }

  // Vérifier le Rate Limiting (Anti-Abus IA)
  const { success: rateLimitSuccess } = await ratelimit.limit(`lyrics_${user.id}`);
  if (!rateLimitSuccess) {
    return { success: false, error: "Vous faites trop de demandes de paroles. Veuillez patienter une minute." };
  }

  const parseResult = generateLyricsInputSchema.safeParse(input);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0].message };
  }

  const result = await generateLyricsWithGemini(parseResult.data);
  return result;
}

