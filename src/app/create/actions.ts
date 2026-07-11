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
      // ─── AFRIQUE DE L'OUEST ───────────────────────────────────────────────
      "Coupé-Décalé": [
        "Ivorian Coupé-Décalé, Abidjan club anthem, atalaku hype man shouts, 132-138bpm",
        "punchy dry snare, deep sub kick, layered sebene electric guitar riff, brass stab hits",
        "call-and-response crowd chants, roukaskas dance energy, boucan farot ambiance",
        "authentic thick Ivorian Nouchi accent, chest-voiced lead male vocal",
        "raw gritty breathiness, slightly nasal tone, passionate African ad-libs",
        "extremely human-sounding vocals, natural room reverb, live crowd feel",
        "hyper-realistic production, party dancefloor energy, West African percussion loop"
      ].join(", "),

      "Rap Ivoire / Drill": [
        "Ivorian Drill hip-hop, Abidjan street rap, 140-148bpm triplet flow",
        "sliding 808 sub-bass with pitch glide, staccato hi-hats, snare roll trap",
        "dark minor piano loop, cinematic string pad, ethereal synth texture",
        "authentic Nouchi slang delivery, aggressive confident male rap vocal",
        "slightly hoarse throat texture, real breath between bars, West African cadence",
        "fast syllable stacking, melodic hook sung with Ivorian lilt",
        "hyper-realistic hip-hop mixing, punchy low-end, studio-quality human rap voice"
      ].join(", "),

      "Zouglou": [
        "Classic Ivorian Zouglou, Abidjan township storytelling music, 95-105bpm",
        "live acoustic conga and djembe percussion, rhythmic maracas, acoustic bass guitar",
        "philosophic social commentary lyrics, melancholic yet uplifting tone",
        "lead tenor vocal with warm chest resonance, spontaneous choir harmonies",
        "Ivorian French accent with Dioula influences, slightly raspy emotional delivery",
        "call-and-response between soloist and backing singers, live concert feel",
        "authentic nostalgic atmosphere, organic instruments, deeply human vocal texture"
      ].join(", "),

      "Afrobeats": [
        "Modern Afrobeats, Lagos Naija vibe, 100-110bpm smooth dancehall groove",
        "warm deep sub-bass, syncopated clave percussion, shekere and talking drum layer",
        "bright electric guitar lick, lush keyboard chords, afro-pop synthesizer melody",
        "smooth melodic male or female lead vocal with Nigerian Yoruba tonal inflection",
        "breathy falsetto hooks, natural vibrato, emotional melismatic runs",
        "extremely realistic human vocal performance, intimate studio mic presence",
        "radio-ready West African pop sound, glossy yet organic production"
      ].join(", "),

      "Mbalax": [
        "Traditional Senegalese Mbalax, Dakar dance music, 120-135bpm",
        "sabar drum polyrhythm, tama talking drum lead, bougarabou bass drum",
        "repetitive hypnotic xalam lute riff, kora arpeggio texture, balafon accents",
        "powerful Wolof-inflected French vocal delivery, strong chest projection",
        "guttural throat ornaments, intense passionate phrasing, call-and-response chorus",
        "authentic Dakar accent, griot storytelling energy, vibrant live percussion",
        "extremely human-sounding voice, natural reverb of a live performance space"
      ].join(", "),

      // ─── AFRIQUE CENTRALE ─────────────────────────────────────────────────
      "Rumba Congolaise": [
        "Classic Congolese Rumba, Kinshasa romantic ballad, 70-85bpm",
        "fingerpicked acoustic guitar sebene riff, warm upright bass, soft brushed snare",
        "lush string arrangement, vintage electric piano comping, gentle maracas",
        "smooth silky tenor lead vocal with deep Lingala-French accent",
        "romantic melismatic phrasing, gentle vibrato, chest voice warmth",
        "intimate close-mic presence, subtle room reverb, elegant nostalgic feel",
        "extremely realistic human vocal, emotional passion of Kinshasa music legends"
      ].join(", "),

      "Afro-Congo": [
        "Modern Afro-Congo pop, Kinshasa club banger, 115-125bpm",
        "heavy kick drum, layered synth bass, electric guitar riff loop",
        "hype animator shouts, crowd response chants, Lingala party energy",
        "charismatic male lead with thick Congolese accent, confident chest projection",
        "ad-lib exclamations, breathless excitement delivery, melodic hook with nasal warmth",
        "dancefloor production, punchy mix, vibrant Central African rhythm section",
        "hyper-realistic energetic vocal performance, authentic Brazzaville-Kinshasa feel"
      ].join(", "),

      // ─── AFRIQUE DU SUD & EST ─────────────────────────────────────────────
      "Amapiano": [
        "South African Amapiano deep house, Johannesburg township sound, 110-116bpm",
        "signature log drum synth bassline, dusty sub-kick, shaker percussion loop",
        "lush jazz piano chords, warm Rhodes melody, marimba-inspired synth top-line",
        "smooth soulful vocals with South African Zulu-English lilt, breathy falsetto",
        "spoken word improvisation sections, whispered ad-libs, relaxed cool delivery",
        "extremely realistic human voice with natural breath and soft consonants",
        "premium studio-quality mix, warm low-end, organic live-recorded feel"
      ].join(", "),

      "Bongo Flava": [
        "East African Bongo Flava, Dar es Salaam urban pop, 90-105bpm",
        "Swahili rhythmic groove, light electronic drums, melodic guitar lick",
        "hip-hop influenced flow mixed with R&B melodic hook",
        "smooth Tanzanian Swahili-inflected French vocal, gentle nasal tone",
        "sweet falsetto runs, laid-back confident delivery, melodic ad-libs",
        "extremely human-sounding voice with East African warmth and intimacy",
        "modern production with organic percussion, radio-friendly African pop feel"
      ].join(", "),

      // ─── MAGHREB & DIASPORA ───────────────────────────────────────────────
      "Raï / Pop Urbaine": [
        "Modern Algerian Raï fused with French urban pop, 95-108bpm",
        "darbuka doum-tak pattern, bendir frame drum, oriental synth arpeggio",
        "electric guitar with Arabic maqam bends, trap hi-hat layer, 808 sub",
        "passionate Oran-accented French vocal, raw emotional delivery",
        "melismatic Arabic ornamentation, husky chest voice with controlled rasp",
        "breathy vulnerability in the verses, powerful explosive chorus delivery",
        "authentic North African accent, extremely human emotional vocal performance"
      ].join(", "),

      "Kizomba": [
        "Angolan Kizomba slow dance, Luanda romantic sensual groove, 60-75bpm",
        "deep semba bass guitar, soft programmed kick, brushed snare, cabasa rhythm",
        "lush warm synthesizer pad, fingerpicked acoustic guitar, vibraphone melody",
        "silky Portuguese-Angolan accented French vocal, intimate hushed delivery",
        "breathy close-mic presence, soft vibrato, sensual vocal whispers",
        "extremely realistic human voice with warm room ambiance",
        "romantic slow-dance production, deep emotional atmosphere, Lusophone African soul"
      ].join(", "),

      // ─── EUROPE & POP INTERNATIONALE ──────────────────────────────────────
      "Pop / R&B": [
        "Contemporary French Pop R&B, radio hit production, 90-105bpm",
        "polished trap-influenced drum programming, warm synthesizer bass, electric piano",
        "lush string section, layered background vocals, melodic guitar accent",
        "clear Parisian French accent, smooth professional vocal delivery",
        "natural vibrato, breathy intimate verses, powerful belted chorus",
        "extremely realistic human voice with studio polish and warmth",
        "premium modern production, glossy R&B feel, emotionally resonant performance"
      ].join(", "),

      "Gospel": [
        "Uplifting French Gospel, worship choir anthem, 75-90bpm",
        "live Hammond B3 organ stabs, grand piano chord voicings, full gospel drum kit",
        "powerful four-part choir harmonies, soaring soprano lead, deep bass foundation",
        "passionate French-accented lead vocal with strong West African diaspora influence",
        "raw emotional delivery, chest voice power, spontaneous melismatic improvisation",
        "natural breath and body in the recording, authentic church acoustic reverb",
        "extremely human choir sound, powerful spiritual energy, tears-inducing performance"
      ].join(", "),

      // ─── NOUVEAUX STYLES EUROPÉENS ────────────────────────────────────────
      "Chanson Française": [
        "Classic French Chanson, Paris cabaret atmosphere, 80-95bpm",
        "acoustic nylon-string guitar, upright bass pizzicato, light accordion melody",
        "subtle brushed jazz drums, intimate piano comping, warm string quartet",
        "iconic Parisian French accent, slight cigarette-voice rasp, poetic phrasing",
        "intimate close-mic delivery, natural breath between phrases, melancholic warmth",
        "extremely realistic human vocal with authentic French diction and emotional depth",
        "timeless romantic Parisian atmosphere, literary storytelling, bistro feel"
      ].join(", "),

      "Afro Trap France": [
        "French Afro Trap, Paris banlieue rap, 140-148bpm",
        "808 sub-bass with African percussion layer, rapid trap hi-hats, hard snare",
        "afrobeat guitar sample chop, melodic autotune hook, dark synth pad",
        "authentic French cité accent with Ivorian or Malian lilt, confident rap flow",
        "melodic sung bridges, street-smart aggressive energy, real breath in bars",
        "extremely human-sounding voice, authentic Parisian banlieue vocal character",
        "premium Afro Trap production, hard-hitting low-end, modern French urban sound"
      ].join(", "),

      "Soul / Jazz France": [
        "French Soul Jazz, late-night intimate club session, 75-90bpm",
        "brushed jazz drum kit, upright bass walking line, Rhodes electric piano",
        "muted trumpet melody, alto saxophone improvisation, warm guitar comping",
        "smooth French-accented soul vocal, natural husky texture, intimate delivery",
        "breathy falsetto moments, natural pitch inflections, jazzy melodic improvisation",
        "extremely realistic human voice with close-mic warmth and natural room tone",
        "sophisticated urban French jazz-soul atmosphere, emotional depth, live feel"
      ].join(", "),
    };
    
    const voiceTag = validData.voice === "Homme"
      ? "authentic warm human male vocal, natural chest resonance, real breath, slightly breathy low register"
      : validData.voice === "Femme"
      ? "authentic warm human female vocal, natural chest and head voice mix, real breath, emotional vibrato"
      : "authentic human vocal, natural breathing, real human voice texture";

    const enrichedStyle = (styleEnrichments[validData.style] || validData.style)
      + `, ${voiceTag}`
      + ", sung in French, extremely realistic human voice, NO robotic artifacts, NO synthetic sound, pure organic human performance";

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

    // --- ETAPE 2 : GENERER LA MUSIQUE ---
    const audioInputUrl = validData.promptAudioUrl || validData.voiceUrl;

    let apiRes: Response;

    if (audioInputUrl) {
      // ✅ CORRECT : Upload + Extend — l'IA continue la musique à partir de ta voix
      // continueAt = point en secondes à partir duquel Suno étend l'audio (OBLIGATOIRE)
      // On prend la durée réelle - 2s comme marge de sécurité, min 1s
      const continueAt = Math.max(1, (validData.audioRecordingDuration ?? 28) - 2);

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
          model: "V3_5",
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
