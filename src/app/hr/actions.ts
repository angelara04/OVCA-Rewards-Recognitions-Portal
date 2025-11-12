// app/hr/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Registry / HR server actions
 *
 * Exports:
 * - getPendingRegistrations
 * - getApprovedRegistrations
 * - getDeniedRegistrations
 * - approveRegistration
 * - denyRegistration
 * - deleteRejectedUser
 * - promoteUserRole
 * - removeUserRole
 *
 * NOTE: adapt table/column names if your DB schema differs.
 */

export async function getPendingRegistrations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registry')
    .select('id, user_id, email, name, form_data, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending registrations:', error)
    return []
  }

  return data || []
}

export async function getApprovedRegistrations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registry')
    .select('id, user_id, email, name, form_data, status, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching approved registrations:', error)
    return []
  }

  return data || []
}

export async function getDeniedRegistrations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registry')
    .select('id, user_id, email, name, form_data, status, denied_at')
    .eq('status', 'denied')
    .order('denied_at', { ascending: false })

  if (error) {
    console.error('Error fetching denied registrations:', error)
    return []
  }

  return data || []
}

/**
 * Approve a pending registration:
 * - copies basic data into 'profiles' (role default 'nominator')
 * - updates registry.status = 'approved' and updated_at
 */
export async function approveRegistration(id: string) {
  const supabase = await createClient()
  const { data: reg } = await supabase
    .from('registry')
    .select('user_id, email, name, form_data')
    .eq('id', id)
    .maybeSingle()

  if (!reg) {
    console.warn('approveRegistration: registry record not found', id)
    return { ok: false, message: 'not found' }
  }

// Insert or update profile safely
const { error: profileError } = await supabase
  .from('profiles')
  .upsert(
    {
      id: reg.user_id,
      email: reg.email,
      name: reg.name,
      role: 'nominator',
    },
    { onConflict: 'id' } // ensures it updates if already exists
  )

if (profileError) {
  console.error('Error inserting/upserting profile:', profileError)
  // don't stop the approval even if this fails
}

const { error: updateError } = await supabase
  .from('registry')
  .update({ status: 'approved', updated_at: new Date().toISOString() })
  .eq('id', id)


  if (updateError) {
    console.error('Error updating registry status:', updateError)
    return { ok: false, message: 'update failed', error: updateError }
  }

  return { ok: true }
}

/**
 * Deny a pending registration (marks registry.status = 'denied' and denied_at timestamp)
 */
export async function denyRegistration(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('registry')
    .update({ status: 'denied', denied_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error denying registration:', error)
    return { ok: false, error }
  }

  return { ok: true }
}

/**
 * Permanently delete a denied user from the registry table.
 * Only deletes if status === 'denied' for safety.
 */
export async function deleteRejectedUser(id: string) {
  const supabase = await createClient()

  // optional safety check
  const { data: row } = await supabase
    .from('registry')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()

  if (!row) return { ok: false, message: 'not found' }
  if (row.status !== 'denied') return { ok: false, message: 'only denied records can be deleted' }

  const { error } = await supabase.from('registry').delete().eq('id', id)

  if (error) {
    console.error('Error deleting rejected user:', error)
    return { ok: false, error }
  }

  return { ok: true }
}

/**
 * Promote user role in profiles table.
 * - userId: id in profiles table
 * - newRole: string (e.g. 'committee_member', 'committee_chair', 'admin')
 *
 * NOTE: adapt roles to your application. If your app has a separate committee_members table,
 * implement insertion into that table instead of / in addition to updating profiles.role.
 */
export async function promoteUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)

  if (error) {
    console.error('Error promoting user role:', error)
    return { ok: false, error }
  }

  return { ok: true }
}

/**
 * Remove / reset user's role (safe default: set to 'nominator').
 * If you want to remove all committee assignments, you may need to delete rows from committee tables as well.
 */
export async function removeUserRole(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role: 'nominator' }).eq('id', userId)

  if (error) {
    console.error('Error removing user role:', error)
    return { ok: false, error }
  }

  return { ok: true }
}
