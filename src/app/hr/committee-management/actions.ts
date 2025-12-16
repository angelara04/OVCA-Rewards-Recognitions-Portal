'use server'

import { createClient } from '@/utils/supabase/server'

export interface Profile {
  id: string
  name: string
  email?: string
  role: string
  department?: string
  created_at?: string
}

/**
 * Server actions for Committee Management
 */

export async function getCommitteeMembers(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, department, created_at')
    .eq('role', 'committee')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching committee members:', error)
    return []
  }

  return (data || []).map(profile => ({
    ...profile,
    created_at: profile.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : ''
  }))
}


export async function getNominators(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, department, created_at')
    .eq('role', 'nominator')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching nominators:', error)
    return []
  }

  return (data || []).map(profile => ({
    ...profile,
    created_at: profile.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : ''
  }))
}


export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, department, created_at')
    .in('role', ['nominator', 'committee'])
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching all profiles:', error)
    return []
  }

  return (data || []).map(profile => ({
    ...profile,
    created_at: profile.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : ''
  }))
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

  if (updateError) return { success: false, message: 'Failed to remove from committee.' }

  return { success: true, message: `User ${userId} removed from committee.` }
}
