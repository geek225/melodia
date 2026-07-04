'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(trackId: string, currentStatus: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tracks')
    .update({ is_favorite: !currentStatus })
    .eq('id', trackId)
    
  if (error) {
    console.error("Failed to toggle favorite:", error)
    return { success: false }
  }
  
  revalidatePath('/music')
  return { success: true }
}
