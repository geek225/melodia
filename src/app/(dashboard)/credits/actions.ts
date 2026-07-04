'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function buyMelodies(amount: number) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return { success: false, error: 'User not authenticated' }
    }

    // Use admin client to bypass RLS for credits update
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      console.error('Missing env vars')
      return { success: false, error: 'Server configuration error' }
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // Get current credits
    const { data: profile, error: fetchError } = await adminClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (fetchError || profile === null) {
      console.error('Profile fetch error:', fetchError)
      return { success: false, error: 'Profile not found' }
    }

    const newCredits = (profile.credits || 0) + amount

    // Update credits
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, newBalance: newCredits }
  } catch (err) {
    console.error('Unexpected error in buyMelodies:', err)
    return { success: false, error: 'Unexpected server error' }
  }
}
