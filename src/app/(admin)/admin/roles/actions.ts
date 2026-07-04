'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const adminAuthClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getStaffUsers() {
  noStore()
  try {
    const { data, error } = await adminAuthClient
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'super_admin'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error fetching staff users:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function searchAllUsers(query: string) {
  try {
    if (!query || query.length < 3) return { success: true, data: [] }
    
    const { data, error } = await adminAuthClient
      .from('profiles')
      .select('id, email, full_name, role')
      .ilike('email', `%${query}%`)
      .limit(10)

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error searching users:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function updateUserRole(userId: string, role: string | null) {
  try {
    if (!userId) throw new Error('ID utilisateur manquant')
    
    // We update the profile role
    const { error } = await adminAuthClient
      .from('profiles')
      .update({ role: role })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating user role:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function inviteUserAndSetRole(email: string, role: string, password?: string) {
  try {
    if (!email) throw new Error('Email manquant')
    
    let userId = ''
    
    if (password) {
      // 1. Créer l'utilisateur avec le mot de passe
      const { data, error: createError } = await adminAuthClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (createError) throw createError
      if (!data.user) throw new Error("Erreur lors de la création de l'utilisateur")
      userId = data.user.id
    } else {
      // 1. Inviter l'utilisateur
      const { data, error: inviteError } = await adminAuthClient.auth.admin.inviteUserByEmail(email)
      if (inviteError) throw inviteError
      if (!data.user) throw new Error("Erreur lors de la création de l'utilisateur")
      userId = data.user.id
    }

    // 2. Attendre que le trigger handle_new_user() crée le profil (peut prendre quelques ms)
    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. Mettre à jour le rôle
    const { error: roleError } = await adminAuthClient
      .from('profiles')
      .update({ role: role })
      .eq('id', userId)

    if (roleError) throw roleError
    
    return { success: true }
  } catch (error: unknown) {
    console.error('Error inviting user:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
