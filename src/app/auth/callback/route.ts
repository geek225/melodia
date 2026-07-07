import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.session?.user) {
      // Check if user is an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()
        
      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        return NextResponse.redirect(`${origin}/admin`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=Lien de vérification invalide ou expiré`)
}
