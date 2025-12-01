// Returns the logged-in user's profile name (server-side using your existing supabase server client)

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) return NextResponse.json({ name: null }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', authData.user.id)
      .maybeSingle()

    return NextResponse.json({ name: profile?.name || null })
  } catch (e) {
    console.error('profile route error', e)
    return NextResponse.json({ name: null }, { status: 500 })
  }
}

