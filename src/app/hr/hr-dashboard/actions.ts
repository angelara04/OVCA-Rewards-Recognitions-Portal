'use server'

import { createClient } from '@/utils/supabase/server'
import {
  getPendingRegistrations,
  getApprovedRegistrations,
  getDeniedRegistrations,
} from '@/app/hr/actions'

export interface Employee {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  status?: 'pending' | 'approved' | 'rejected'
  dateRegistered?: string
}

//  Returns the SAME DATA SHAPE as employee-registration → "All" tab
export async function getAllRegistrations(): Promise<Employee[]> {
  const [pending, approved, denied] = await Promise.all([
    getPendingRegistrations(),
    getApprovedRegistrations(),
    getDeniedRegistrations(),
  ])

  const mappedPending: Employee[] = (pending ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role ?? 'N/A',
    department: r.form_data?.department ?? 'N/A',
    status: 'pending' as const, // literal type cast
    dateRegistered: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-PH')
      : undefined,
  }))

  const mappedApproved: Employee[] = (approved ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role ?? 'N/A',
    department: r.form_data?.department ?? 'N/A',
    status: 'approved' as const, // literal type cast
    dateRegistered: r.updated_at
      ? new Date(r.updated_at).toLocaleDateString('en-PH')
      : undefined,
  }))

  const mappedDenied: Employee[] = (denied ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role ?? 'N/A',
    department: r.form_data?.department ?? 'N/A',
    status: 'rejected' as const, // literal type cast
    dateRegistered: r.denied_at
      ? new Date(r.denied_at).toLocaleDateString('en-PH')
      : undefined,
  }))

  // Combine all registrations: approved first, then pending, then denied
  return [...mappedApproved, ...mappedPending, ...mappedDenied]
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
