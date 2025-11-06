'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPendingRegistrations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registry')
    .select('id, user_id, email, name, form_data, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) return []
  return data || []
}

export async function getApprovedRegistrations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registry')
    .select('id, user_id, email, name, form_data, status, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getDeniedRegistrations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registry')
    .select('id, user_id, email, name, form_data, status, denied_at')
    .eq('status', 'denied')
    .order('denied_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function approveRegistration(id: string) {
  const supabase = await createClient()
  const { data: reg } = await supabase
    .from('registry')
    .select('user_id, email, name, form_data')
    .eq('id', id)
    .maybeSingle()

  if (!reg) return

  await supabase.from('profiles').insert({
    id: reg.user_id,
    email: reg.email,
    name: reg.name,
    role: 'nominator',
  })

  await supabase
    .from('registry')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)
}

export async function denyRegistration(id: string) {
  const supabase = await createClient()
  await supabase
    .from('registry')
    .update({ status: 'denied', denied_at: new Date().toISOString() })
    .eq('id', id)
}

export async function deleteRejectedUser(id: string) {
  const supabase = await createClient()
  await supabase.from('registry').delete().eq('id', id)
}
