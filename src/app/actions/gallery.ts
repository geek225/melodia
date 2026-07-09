'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function togglePublic(trackId: string, currentStatus: boolean) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorisé" }

  // Check the limit if we are trying to make it public
  if (!currentStatus) {
    const { count, error: countError } = await supabase
      .from('tracks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', true)

    if (countError) {
      console.error(countError)
      return { success: false, message: "Erreur lors de la vérification de la limite." }
    }

    if (count !== null && count >= 5) {
      return { success: false, message: "Tu as atteint ta limite de 5 musiques publiques. Dé-publie une autre musique d'abord." }
    }
  }
  
  const { error } = await supabase
    .from('tracks')
    .update({ is_public: !currentStatus })
    .eq('id', trackId)
    .eq('user_id', user.id) // Ensure they own the track
    
  if (error) {
    console.error("Failed to toggle public:", error)
    return { success: false, message: "Erreur lors de la mise à jour." }
  }
  
  revalidatePath('/')
  revalidatePath('/music')
  return { success: true }
}

export async function likePublicTrack(trackId: string) {
  // Use service role to bypass RLS for updating likes
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error: fetchError } = await supabaseAdmin
    .from('tracks')
    .select('likes_count')
    .eq('id', trackId)
    .single()
    
  if (fetchError || !data) {
    return { success: false }
  }
  
  const newCount = (data.likes_count || 0) + 1
  
  const { error: updateError } = await supabaseAdmin
    .from('tracks')
    .update({ likes_count: newCount })
    .eq('id', trackId)
    
  if (updateError) {
    return { success: false }
  }
  
  revalidatePath('/')
  return { success: true, newCount }
}

export async function rateFeaturedTrack(trackId: string, rating: number) {
  if (rating < 1 || rating > 5) return { success: false, message: "Note invalide" };

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error: fetchError } = await supabaseAdmin
    .from('tracks')
    .select('rating_sum, rating_count')
    .eq('id', trackId)
    .single()
    
  if (fetchError || !data) {
    return { success: false, message: "Musique introuvable" }
  }
  
  const newSum = (data.rating_sum || 0) + rating;
  const newCount = (data.rating_count || 0) + 1;
  
  const { error: updateError } = await supabaseAdmin
    .from('tracks')
    .update({ rating_sum: newSum, rating_count: newCount })
    .eq('id', trackId)
    
  if (updateError) {
    return { success: false, message: "Erreur de mise à jour" }
  }
  
  revalidatePath('/')
  return { success: true, newSum, newCount }
}
