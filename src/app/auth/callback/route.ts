import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.redirect(`${origin}/login`)

      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      // If no profile, check registry
      if (!profile) {
        const { data: registry } = await supabase
          .from('registry')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle()

        // If user is registered but still pending → go to pending page
        if (registry?.status === 'pending') {
          return NextResponse.redirect(`${origin}/pending`)
        }

        // If no registry record → new user → go to registry page
        if (!registry) {
          return NextResponse.redirect(`${origin}/registry`)
        }

        // If denied → send to denied info page
        if (registry?.status === 'denied') {
          return NextResponse.redirect(`${origin}/denied`)
        }
      }

      // redirect based on role
      if (profile?.role === 'admin') next = '/admin'
      else if (profile?.role === 'committee') next = '/committee'
      else if (profile?.role === 'nominator') next = '/nominators'

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) return NextResponse.redirect(`${origin}${next}`)
      else if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`)
      else return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
