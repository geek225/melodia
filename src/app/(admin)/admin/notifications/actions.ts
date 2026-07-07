'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function getAdminNotifications() {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching admin notifications:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function sendNotification(data: { title: string, message: string, user_id?: string | null }) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert([{
        title: data.title,
        message: data.message,
        user_id: data.user_id || null, // null means global
      }])

    if (error) throw error

    revalidatePath('/admin/notifications')
    return { success: true }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function findUserByEmail(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (error || !data) return { success: false, error: 'Utilisateur non trouvé' }

    return { success: true, user: data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
