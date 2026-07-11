'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ratelimit } from '@/lib/rate-limit'

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
  audioRecordingDuration: z.number().min(1).max(60).optional().default(28)
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
    const styleEnrichments: Record<string, string> = {
      // ─── AFRIQUE DE L'OUEST ───────────────────────────────────────────────
      "Coupé-Décalé": [
        "Ivorian Coupé-Décalé, pure Abidjan club rhythm, 130-140bpm",
        "heavy syncopated drum machine loop, deep driving bassline, bright repetitive electric guitar sebene",
        "shakers, cowbell hits, energetic synthesizer stabs, electronic snare rolls",
        "very strong authentic West African Ivorian accent, energetic hype man shouts (atalaku)",
        "call-and-response vocal structure, raw party energy, nouchi slang cadence",
        "extremely realistic human vocal performance, NO robotic artifacts"
      ].join(", "),

      "Rap Ivoire / Drill": [
        "Ivorian Drill, Abidjan hip-hop, 140bpm sliding 808 bass, dark piano melody",
        "staccato trap hi-hats, syncopated African percussion layer, hard hitting snare",
        "very strong authentic West African Ivorian accent, gritty nouchi slang rap flow",
        "aggressive chest voice delivery, razor-sharp street cadence",
        "extremely realistic human rap vocal, NO robotic artifacts"
      ].join(", "),

      "Zouglou": [
        "Traditional Ivorian Zouglou, 95-105bpm, authentic Abidjan woyo style",
        "live acoustic conga, djembe, syncopated shaker rhythms, acoustic bass",
        "very strong authentic West African Ivorian accent, soulful choir harmonies",
        "emotional tenor lead vocal, call-and-response structure, storytelling cadence",
        "extremely realistic human voice, organic acoustic production"
      ].join(", "),

      "Afrobeats": [
        "Modern Nigerian Afrobeats, 100-110bpm Naija pop groove, smooth dancehall rhythm",
        "log drum bass, syncopated clave, shekere, lush synthesizer chords, muted guitar",
        "very strong authentic West African Nigerian accent, smooth melodic delivery",
        "pidgin english and local dialect inflections, warm breathy vocal tone",
        "extremely realistic human vocal, premium afro-pop studio mix"
      ].join(", "),

      "Mbalax": [
        "Traditional Senegalese Mbalax, 120-135bpm, explosive Sabar drum rhythms",
        "tama talking drum, bougarabou, repetitive xalam lute, bright brass section",
        "very strong authentic West African Senegalese accent, powerful high-energy vocal",
        "intense passionate phrasing, Wolof language inflections, guttural ornaments",
        "extremely realistic human voice, vibrant live acoustic energy"
      ].join(", "),

      // ─── AFRIQUE CENTRALE ─────────────────────────────────────────────────
      "Rumba Congolaise": [
        "Classic Congolese Rumba, Kinshasa romantic music, 75-85bpm",
        "complex fingerpicked acoustic guitar sebene, warm upright bass, gentle shaker",
        "very strong authentic Central African Congolese accent, silky smooth tenor voice",
        "Lingala language inflections, romantic melismatic phrasing, emotional warmth",
        "extremely realistic human voice, intimate acoustic atmosphere"
      ].join(", "),

      "Afro-Congo": [
        "Modern Afro-Congo pop, Ndombolo dance rhythm, 115-125bpm",
        "heavy club kick drum, layered electronic bass, fast electric guitar riff",
        "very strong authentic Central African Congolese accent, energetic animator shouts",
        "confident chest projection, Lingala party energy, call-and-response",
        "extremely realistic human voice, punchy dancefloor production"
      ].join(", "),

      // ─── AFRIQUE DU SUD & EST ─────────────────────────────────────────────
      "Amapiano": [
        "South African Amapiano deep house, 110-115bpm",
        "heavy signature log drum bassline, dusty shaker loops, deep sub-kick",
        "jazz piano chords, soulful synth melodies",
        "very strong authentic South African accent, smooth soulful vocal delivery",
        "Zulu language inflections, whispered ad-libs, relaxed cool vibe",
        "extremely realistic human voice, premium deep house mix"
      ].join(", "),

      "Bongo Flava": [
        "East African Bongo Flava, Tanzanian urban pop, 90-105bpm",
        "Swahili rhythmic groove, light electronic drums, melodic guitar",
        "very strong authentic East African Tanzanian accent, smooth R&B infused vocal",
        "Swahili language inflections, sweet falsetto runs, laid-back delivery",
        "extremely realistic human voice, warm radio-friendly production"
      ].join(", "),

      // ─── MAGHREB & DIASPORA ───────────────────────────────────────────────
      "Raï / Pop Urbaine": [
        "Modern Algerian Raï fused with urban pop, 95-108bpm",
        "darbuka and bendir percussion, 808 sub bass, oriental synth arpeggio",
        "very strong authentic North African Maghreb accent, passionate emotional delivery",
        "Arabic melismatic vocal ornamentation, controlled rasp, powerful chorus",
        "extremely realistic human voice, cinematic urban production"
      ].join(", "),

      "Kizomba": [
        "Angolan Kizomba slow dance, 60-75bpm romantic groove",
        "deep semba bass, soft programmed kick, cabasa rhythm, lush synthesizer pad",
        "very strong authentic African Lusophone Angolan accent, intimate sensual vocal",
        "Portuguese language inflections, soft breathy delivery, emotional warmth",
        "extremely realistic human voice, deep romantic atmosphere"
      ].join(", "),

      // ─── EUROPE & POP INTERNATIONALE ──────────────────────────────────────
      "Pop / R&B": [
        "Contemporary Pop R&B, radio hit production, 90-105bpm",
        "polished trap-influenced drums, warm synth bass, lush strings",
        "very strong authentic European French accent, smooth professional vocal",
        "clear Parisian diction, natural vibrato, powerful belted chorus",
        "extremely realistic human voice, glossy premium mix"
      ].join(", "),

      "Gospel": [
        "Uplifting Gospel worship choir anthem, 75-90bpm",
        "live Hammond B3 organ, grand piano, full gospel drum kit",
        "very strong authentic European French accent with soulful inflections",
        "powerful lead vocal, massive four-part choir harmonies, emotional belts",
        "extremely realistic human voice, authentic church acoustics"
      ].join(", "),

      // ─── NOUVEAUX STYLES EUROPÉENS ────────────────────────────────────────
      "Chanson Française": [
        "Classic French Chanson, Paris cabaret atmosphere, 80-95bpm",
        "acoustic guitar, upright bass, light accordion, subtle jazz drums",
        "very strong authentic European French accent, iconic Parisian diction",
        "poetic phrasing, intimate close-mic delivery, melancholic warmth",
        "extremely realistic human voice, timeless acoustic production"
      ].join(", "),

      "Afro Trap France": [
        "French Afro Trap, Paris urban rap, 140bpm",
        "808 sub-bass, rapid hi-hats, hard snare, afrobeat guitar sample",
        "very strong authentic European French banlieue accent, confident rap flow",
        "street-smart energy, melodic sung bridges, modern slang",
        "extremely realistic human voice, hard-hitting urban mix"
      ].join(", "),

      "Soul / Jazz France": [
        "French Soul Jazz, intimate club session, 75-90bpm",
        "brushed jazz drums, walking upright bass, Rhodes piano, muted trumpet",
        "very strong authentic European French accent, smooth husky soul vocal",
        "intimate jazzy phrasing, breathy falsetto moments",
        "extremely realistic human voice, warm live acoustic room tone"
      ].join(", "),

      // ─── EUROPE & RAP INTERNATIONAL ──────────────────────────────────────────────────────
      "Rap Français": [
        "Classic French hip-hop, Parisian urban style, 90bpm boom bap or 140bpm trap",
        "sampled jazz break, 808 bass, crisp snare, cinematic strings",
        "very strong authentic European French accent, razor-sharp rap flow",
        "precise Parisian diction, introspective verses, explosive chorus",
        "extremely realistic human rap voice, premium urban mix"
      ].join(", "),

      "Rap Américain": [
        "American hip-hop rap, Atlanta trap or NY boom bap, 130-148bpm",
        "heavy 808 sub-bass, rapid trap hi-hats, dark piano loop",
        "very strong authentic American English accent, native US street cadence",
        "aggressive delivery, ad-lib exclamations, rapid syllable stacking",
        "extremely realistic human rap voice, premium trap mix"
      ].join(", "),
    };
    
    const voiceTag = validData.voice === "Homme"
      ? "authentic warm human male vocal, natural chest resonance, real breath, slightly breathy low register"
      : validData.voice === "Femme"
      ? "authentic warm human female vocal, natural chest and head voice mix, real breath, emotional vibrato"
      : "authentic human vocal, natural breathing, real human voice texture";

    // Construire le style enrichi : si plusieurs styles, on fusionne leurs descriptions
    let enrichedStyle: string;
    const selectedStyles = validData.styles && validData.styles.length > 0 ? validData.styles : [validData.style];

    if (selectedStyles.length > 1) {
      // Fusion multi-styles : on prend les 3 premiers descripteurs de chaque style
      const blendedParts = selectedStyles.map(s => {
        const enriched = styleEnrichments[s] || s;
        return enriched.split(", ").slice(0, 3).join(", ");
      });
      enrichedStyle = blendedParts.join(" | ")
        + `, ${voiceTag}`
        + ", extremely realistic human voice, NO robotic artifacts, NO synthetic sound, pure organic human performance";
    } else {
      enrichedStyle = (styleEnrichments[selectedStyles[0]] || selectedStyles[0])
        + `, ${voiceTag}`
        + ", sung in French, extremely realistic human voice, NO robotic artifacts, NO synthetic sound, pure organic human performance";
    }
    // Tronquer à 900 chars max pour respecter la limite Suno V4_5 (1000 chars)
    if (enrichedStyle.length > 900) {
      enrichedStyle = enrichedStyle.substring(0, 900);
    }

    // --- ETAPE 1 : GENERER LES PAROLES ---
    lyricsText = "";

    // Si le texte dépasse 200 caractères ou contient des balises de structure, on considère que ce sont les paroles finales
    if (validData.prompt && (validData.prompt.length > 200 || (validData.prompt.includes("[") && validData.prompt.includes("]")))) {
      lyricsText = validData.prompt;
    } else {
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
    } // Fin du else

    // Fallback de sécurité si les paroles échouent (pour ne pas bloquer l'utilisateur)
    if (!lyricsText) {
      lyricsText = `[Intro]\n[Verse 1]\n${validData.prompt || "Chant en français"}\n[Chorus]\nOn y va !\n[Outro]`;
    }

    // --- ETAPE 2 : GENERER LA MUSIQUE ---
    const audioInputUrl = validData.promptAudioUrl || validData.voiceUrl;

    let apiRes: Response;

    if (audioInputUrl) {
      // ✅ CORRECT : Upload + Extend — l'IA continue la musique à partir de ta voix
      // continueAt = point en secondes à partir duquel Suno étend l'audio (OBLIGATOIRE)
      // ⚠️ On limite à 6 secondes MAX : Suno n'a besoin que de 4-6s pour capter la mélodie
      // et l'accent vocal. Au-delà, ça allonge juste la phase de voix brute sans instrumental.
      const continueAt = Math.min(6, Math.max(1, (validData.audioRecordingDuration ?? 6) - 1));

      apiRes = await fetch("https://api.sunoapi.org/api/v1/generate/upload-extend", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uploadUrl: audioInputUrl,       // URL publique de l'audio vocal uploadé
          defaultParamFlag: true,         // Mode custom (on fournit style + prompt)
          instrumental: false,
          prompt: lyricsText,             // Les paroles générées
          style: enrichedStyle,
          title: validData.title || "Nouvelle Musique",
          continueAt,                     // ✅ OBLIGATOIRE : point de départ de l'extension
          model: "V4_5",                  // V4_5 compatible avec upload-extend
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
        return { success: false, error: `Erreur API Suno: ${result.msg || 'Format invalide'}` };
      }
    } else {
      const errorText = await apiRes.text();
      console.error("Erreur HTTP API Suno:", apiRes.status, errorText);
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
