'use client'

import React, { useEffect, useState } from 'react'
import Card from '@/components/card'
import Button from '@/components/button'
import ProgressCard from '@/components/progressCard'
import Section from '@/components/section'
import { MoveRight, FolderX, MoreHorizontal } from 'lucide-react'
import Table from '@/components/table/hr-registration-table'
import DropdownMenu from '@/components/dropdown-menu'
import ConfirmModal from '@/components/confirm-modal'
import { useRouter } from 'next/navigation'
import { getDashboardCounts, getAllRegistrations  } from './actions'

interface Employee {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  status?: 'pending' | 'approved' | 'rejected'
  dateRegistered?: string
}

export default function Page() {
  const [counts, setCounts] = useState({
    nominations: 0,
    pendingRegistrations: 0,
    activeCommittee: 0,
    totalRegistered: 0,
  })

  const [profiles, setProfiles] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const [modalData, setModalData] = useState<{ action: 'approve' | 'reject'; name: string } | null>(null)
  const router = useRouter()

  // Table columns
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'dateRegistered', label: 'Date Registered' },
  ]

  // Load dashboard counts & profiles
async function loadData() {
  setLoading(true)
  try {
    const [dashboardCounts, all] = await Promise.all([
      getDashboardCounts(),
      getAllRegistrations(),
    ])

    setCounts(dashboardCounts)
    setProfiles(all)
  } catch (err) {
    console.error('Error loading HR dashboard data:', err)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadData()
  }, [])

  const hasResults = profiles.length > 0

  // Dropdown position for table actions
  function openActionsDropdown(e: React.MouseEvent, index: number) {
    const button = e.currentTarget as HTMLElement
    const container = button.closest('.table-container') as HTMLElement | null
    if (!container) return
    const buttonRect = button.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    setDropdownPosition({
      top: buttonRect.bottom - containerRect.top + 4,
      left: buttonRect.left - containerRect.left - 90,
    })
    setOpenDropdownIndex(prev => (prev === index ? null : index))
  }

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-center p-10">
      <div className="content-area w-full flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 w-full max-w-6xl">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--black)]">HR Dashboard</h1>
            <p className="text-base text-[var(--dark-grey)]">
              Manage the Gawad Tsanselor system and oversee all nomination processes
            </p>
          </div>
          <Button
          size="sm"
          variant="primary"
          onClick={() => router.push('./employee-registration')}
        >
          <div className="px-5 py-1">Review Registrations</div>
        </Button>

        </div>

        {/* Cards section */}
        <div className="w-full flex flex-col gap-2 md:flex-row mb-5">
          <Card description="Nominations" number={counts.nominations} />
          <Card description="Active Committee Members" number={counts.activeCommittee} />
          <Card description="Pending Registrations" number={counts.pendingRegistrations} />
          <Card description="Total Registered" number={counts.totalRegistered} />
        </div>

        {/* Portal Status & Progress */}
        <Section width="w-full" alignment="p-10 mb-5">
          <div className="flex flex-row justify-between">
            <span className="font-bold text-2xl">Portal Status</span>
            <div className="flex flex-row gap-2 rounded-2xl p-2 transition-all duration-200 ease-out hover:scale-103 hover:-translate-y-0 hover:cursor-pointer motion-safe:transform">
              <span className="text-[14px] text-[var(--forest-green)]">Manage Settings</span>
              <MoveRight className="text-[var(--forest-green)]" />
            </div>
          </div>

          {/* Placeholder Progress Cards (keep as-is) */}
          <div className="flex flex-col justify-center gap-4 mt-4 w-full lg:flex-row items-center">
            <ProgressCard
              variant="countdown"
              title="Nomination Process"
              durationDays={10}
              endDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)}
            />
            <ProgressCard
              variant="progress"
              title="Committee Evaluation"
              progress={100}
              durationDays={10}
            />
          </div>
        </Section>

        {/* Profiles Table */}
        <Section width="w-full" alignment="p-10">
          <span className="font-bold text-2xl">Recent Employee Registrations</span>
          <div className="table-container mt-4 border border-[var(--outline-grey)] rounded-md bg-[var(--white)] min-h-[60vh] flex flex-col w-full relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <div className="w-10 h-10 border-4 border-[var(--maroon)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--dark-grey)] text-sm font-medium">Loading...</p>
              </div>
            ) : hasResults ? (
              <div className="w-full overflow-auto">
                <Table
                  columns={columns}
                  data={profiles}
                  renderActions={(row, i) => {
                    const employee = profiles[i]
                    const isPending = employee.status === 'pending'
                    const iconColor = isPending ? 'text-[var(--maroon)]' : 'text-[var(--outline-grey)]'
                    const cursor = isPending ? 'cursor-pointer' : 'cursor-not-allowed'
                    return (
                      <button
                        disabled={!isPending}
                        className={`${iconColor} ${cursor}`}
                        onClick={(e) => {
                          if (!isPending) return
                          openActionsDropdown(e, i)
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    )
                  }}
                />
                {typeof window !== 'undefined' && openDropdownIndex !== null && dropdownPosition && (
                  <DropdownMenu
                    position={dropdownPosition}
                    onCloseAction={() => setOpenDropdownIndex(null)}
                    items={[
                      {
                        label: 'Approve',
                        color: 'text-[var(--forest-green)]',
                        onClickAction: () =>
                          setModalData({ action: 'approve', name: profiles[openDropdownIndex!].name }),
                      },
                      {
                        label: 'Reject',
                        color: 'text-[var(--maroon)]',
                        onClickAction: () =>
                          setModalData({ action: 'reject', name: profiles[openDropdownIndex!].name }),
                      },
                    ]}
                  />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-gray-500">
                <FolderX size={100} className="mb-4 opacity-70" />
                <p className="font-bold text-3xl">No Results Found</p>
              </div>
            )}
          </div>
        </Section>

        {/* Confirm Modal */}
        {modalData && (
          <ConfirmModal
            action={modalData.action}
            onCancelAction={() => setModalData(null)}
            onConfirmAction={() => {
              alert(`${modalData.action === 'approve' ? 'Approved' : 'Rejected'} ${modalData.name}`)
              setModalData(null)
            }}
          />
        )}
      </div>
    </Section>
  )
}
