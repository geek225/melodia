'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ratelimit } from '@/lib/rate-limit'

import { z } from 'zod'

const trackSchema = z.object({
  title: z.string().max(100, "Le titre ne doit pas dépasser 100 caractères").optional().default("Nouvelle Musique"),
  prompt: z.string().min(3, "La description est trop courte").max(500, "La description ne doit pas dépasser 500 caractères"),
  style: z.string().min(1, "Le style est requis").max(50, "Le style est trop long"),
  mood: z.string().max(50).optional().default(""),
  language: z.string().max(50).optional().default("fr"),
  voice: z.string().max(50).optional().default(""),
  duration: z.string().max(20).optional().default("2min30s")
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
  const { data: profile, error: profileError } = await adminAuthClient
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError, "Profile:", profile);
    throw new Error(`Erreur lors de la récupération du profil: ${profileError?.message || 'Profil non trouvé'}`)
  }

  if (profile.credits < 10) {
    return { success: false, error: 'INSUFFICIENT_FUNDS' }
  }

  // 2. Déduire 10 Mélodies
  const { error: updateError } = await adminAuthClient
    .from('profiles')
    .update({ credits: profile.credits - 10 })
    .eq('id', user.id)

  if (updateError) {
    throw new Error('Erreur lors de la déduction des Mélodies')
  }

  // 3. Appel de l'API Treblo
  const apiKey = process.env.TREBLO_API_KEY || "sksonauto_48dtMwZYfnrRApJ0JAZ5p09Ep9w10p4xgDMSUQjrkf3JWu4I";
  
  let apiTaskId = null;
  
  // Conversion de la durée en length_range (multiples de 30s)
  let lengthRange = [120, 150]; // Par défaut (2min - 2min30)
  if (validData.duration === "1min30s") {
    lengthRange = [60, 90];
  } else if (validData.duration === "2min30s") {
    lengthRange = [120, 150];
  }
  
  try {
    const styleEnrichments: Record<string, string> = {
      "Amapiano": "Amapiano, log drums, deep bass, south african dance, shaker, energetic",
      "Afrobeats": "Afrobeats, naija pop, smooth, danceable, rhythmic shakers, tropical",
      "Coupé-Décalé": "Coupé-Décalé, fast tempo, energetic african drums, festive, animation, ivorian dance",
      "Rumba Congolaise": "Rumba Congolaise, sebene guitar, slow tempo, romantic, smooth vocals, elegant, kinshasa",
      "Pop / R&B": "Pop, contemporary R&B, smooth vocals, modern beat, emotional, melodic",
      "Gospel": "Gospel, uplifting choir, spiritual, soulful vocals, praise, organ, warm"
    };
    
    const enrichedStyle = styleEnrichments[validData.style] || validData.style;

    const apiRes = await fetch("https://api.treblo.com/v1/generations/v3", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: `[Genre: ${enrichedStyle}] [Mood: ${validData.mood || 'Vibrant'}] [Vocals: ${validData.voice || 'Vocals'}, ${validData.language || 'French'} language] Theme: ${validData.prompt}`,
        length_range: lengthRange
      })
    });
    
    if (apiRes.ok) {
      const data = await apiRes.json();
      apiTaskId = data.task_id;
    } else {
      const errorText = await apiRes.text();
      console.error("Erreur API Treblo:", errorText);
    }
  } catch (err) {
    console.error("Erreur réseau API MusicAPI:", err);
  }

  // 4. Création de la musique dans la base de données
  const { data, error } = await supabase
    .from('tracks')
    .insert([
      {
        user_id: user.id,
        title: validData.title,
        prompt: validData.prompt,
        style: validData.style,
        duration: validData.duration,
        status: 'processing',
        audio_url: apiTaskId ? `task:${apiTaskId}` : null
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
