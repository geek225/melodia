'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Mot de passe ou email incorrect')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user?.id).single()

  revalidatePath('/', 'layout')
  
  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/register?error=Impossible de créer le compte')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user?.id).single()

  revalidatePath('/', 'layout')
  
  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}
