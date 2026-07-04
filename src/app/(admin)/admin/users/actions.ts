'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const adminAuthClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUsers() {
  noStore()
  try {
    const { data, error } = await adminAuthClient
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    // Also fetch those where role is null
    const { data: nullRoleData, error: nullRoleError } = await adminAuthClient
      .from('profiles')
      .select('*')
      .is('role', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (nullRoleError) throw nullRoleError

    const allData = [...(data || []), ...(nullRoleData || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return { success: true, data: allData }
  } catch (error: unknown) {
    console.error('Error fetching users:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function assignCredits(userIds: string[], amount: number) {
  try {
    if (!userIds || userIds.length === 0) {
      return { success: false, error: 'Aucun utilisateur sélectionné' }
    }

    const { data: users, error: fetchError } = await adminAuthClient
      .from('profiles')
      .select('id, credits')
      .in('id', userIds)
      
    if (fetchError) throw fetchError

    const promises = users.map(user => 
      adminAuthClient
        .from('profiles')
        .update({ credits: (user.credits || 0) + amount })
        .eq('id', user.id)
    )

    await Promise.all(promises)

    return { success: true }
  } catch (error: unknown) {
    console.error('Error assigning credits:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function deleteUsers(userIds: string[]) {
  try {
    if (!userIds || userIds.length === 0) {
      return { success: false, error: 'Aucun utilisateur sélectionné' }
    }

    const promises = userIds.map(id => 
      adminAuthClient.auth.admin.deleteUser(id)
    )

    const results = await Promise.all(promises)
    
    // Check if any deletion failed
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw errors[0].error
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting users:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
