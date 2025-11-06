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

export async function promoteToCommittee(userId: string) {
  const supabase = await createClient()
  if (!userId) return { success: false, message: 'User ID is required.' }

  const { data: user, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError) return { success: false, message: 'Error fetching user.' }
  if (!user) return { success: false, message: 'User not found.' }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'committee' })
    .eq('id', userId)

  if (updateError) return { success: false, message: 'Failed to update role.' }

  return { success: true, message: `User ${userId} promoted to committee.` }
}

export async function removeFromCommittee(userId: string) {
  const supabase = await createClient()
  if (!userId) return { success: false, message: 'User ID is required.' }

  const { data: user, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError) return { success: false, message: 'Error fetching user.' }
  if (!user) return { success: false, message: 'User not found.' }
  if (user.role !== 'committee')
    return { success: false, message: 'User is not a committee member.' }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'nominator' })
    .eq('id', userId)

  if (updateError)
    return { success: false, message: 'Failed to remove from committee.' }

  return { success: true, message: `User ${userId} removed from committee.` }
}

export async function getCommitteeMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('role', 'committee')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching committee members:', error)
    return []
  }

  return data || []
}

