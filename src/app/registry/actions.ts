'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerUser(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const department = formData.get('department') as string

  // Check if user already exists in registry
  const { data: existing } = await supabase
    .from('registry')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing?.status === 'pending') redirect('/pending')
  if (existing?.status === 'approved') redirect('/')

  const form_data = { department }

  const { error } = await supabase.from('registry').insert({
    user_id: user.id,
    email: user.email,
    name,
    form_data,
    status: 'pending',
  })

  if (error) {
    console.error('Error inserting registry:', error)
    redirect('/error')
  }

  redirect('/pending')
}
