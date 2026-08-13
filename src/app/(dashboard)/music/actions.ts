'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(trackId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const { error } = await supabase
    .from('tracks')
    .update({ is_favorite: !currentStatus })
    .eq('id', trackId)
    .eq('user_id', user.id)
    
  if (error) {
    console.error("Failed to toggle favorite:", error)
    return { success: false }
  }
  
  revalidatePath('/music')
  return { success: true }
}
