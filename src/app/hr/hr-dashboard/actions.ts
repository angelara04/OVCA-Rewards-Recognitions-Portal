'use server'

import { createClient } from '@/utils/supabase/server'
import {
  getPendingRegistrations,
  getDeniedRegistrations,
} from '@/app/hr/employee-registration/actions'
import { getAllProfiles } from '@/app/hr/committee-management/actions'

export interface Employee {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  status?: 'pending' | 'approved' | 'rejected'
  dateRegistered?: string
}

export interface PortalSettings {
  nomination_start_date: string | null
  nomination_end_date: string | null
  scoring_start_date: string | null
  scoring_end_date: string | null
}

//  Returns the SAME DATA SHAPE as employee-registration → "All" tab
export async function getAllRegistrations(): Promise<Employee[]> {
  const [pending, profiles, denied] = await Promise.all([
    getPendingRegistrations(),
    getAllProfiles(),
    getDeniedRegistrations(),
  ])

  const mappedPending: Employee[] = (pending ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role ?? 'N/A',
    department: r.form_data?.department ?? 'N/A',
    status: 'pending' as const, 
    dateRegistered: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-PH')
      : undefined,
  }))

  const mappedProfiles: Employee[] = (profiles ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role ?? 'N/A',
    department: r.department ?? 'N/A',
    status: 'approved' as const,
    dateRegistered: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-PH')
      : undefined,
  }))

  const mappedDenied: Employee[] = (denied ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role ?? 'N/A',
    department: r.form_data?.department ?? 'N/A',
    status: 'rejected' as const, 
    dateRegistered: r.denied_at
      ? new Date(r.denied_at).toLocaleDateString('en-PH')
      : undefined,
  }))

  return [...mappedProfiles, ...mappedPending, ...mappedDenied]
}


/**
 * Dashboard card counts
 */
export async function getDashboardCounts() {
  const supabase = await createClient()

  const { count: pendingCount } = await supabase
    .from('registry')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: committeeCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'committee')

  const { count: totalRegistered } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  const { count: nominations } = await supabase
    .from('registry')
    .select('id', { count: 'exact', head: true })

  return {
    nominations: nominations ?? 0,
    pendingRegistrations: pendingCount ?? 0,
    activeCommittee: committeeCount ?? 0,
    totalRegistered: totalRegistered ?? 0,
  }
}

/**
 * Fetch Portal Dates/Settings
 */
export async function getPortalSettings(): Promise<PortalSettings | null> {
  const supabase = await createClient()
  
  // 1. Fetch the rows where setting_key is either 'nomination_period' or 'scoring_period'
  const { data, error } = await supabase
    .from('portal_settings') 
    .select('setting_key, start_at, end_at')
    .in('setting_key', ['nomination_period', 'scoring_period'])

  if (error || !data) {
    console.error('Error fetching portal settings:', error)
    return null
  }

  // 2. Map the rows to the single object structure the frontend expects
  const nominationRow = data.find(row => row.setting_key === 'nomination_period')
  const scoringRow = data.find(row => row.setting_key === 'scoring_period')

  return {
    nomination_start_date: nominationRow?.start_at ?? null,
    nomination_end_date: nominationRow?.end_at ?? null,
    scoring_start_date: scoringRow?.start_at ?? null,
    scoring_end_date: scoringRow?.end_at ?? null,
  }
}